**Please read the whoe before doing anything.**
Last week, on 2023-03-14, Mautic FE was complaining that request has been blocked by cors policy


I took a look at the PVC for mautic-db and found that it has 28GiB, 
```
SELECT
    table_name AS "Table",
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM
    information_schema.TABLES
WHERE
    table_schema = "mautic_db"
ORDER BY
    (data_length + index_length) DESC;
```
And this:
```
SELECT
    table_schema AS "mautic_db",
    SUM(data_length + index_length) / 1024 / 1024 / 1024 AS "Size (GB)"
FROM
    information_schema.TABLES
GROUP BY
    table_schema;
```

so I decide to clean up some tables that full of outdated record:

In Mautic, there are several tables that you can clean up to help reduce the size of your database and improve performance. Here are some examples:

Leads: The leads table contains information about your leads, including their contact information, lead score, and activity history. If you have old or inactive leads in your database, you can delete them to reduce the size of this table.

SELECT
    COUNT(*)
FROM
    leads
WHERE
    date_added < DATE_SUB(NOW(), INTERVAL 6 MONTH);
+ ----------+
| COUNT(*)  | 
+ ----------+
| 9385936   |
+ ----------+
and

DELETE FROM leads WHERE date_added < DATE_SUB(NOW(), INTERVAL 6 MONTH);

Autid log : The audit_log table contains information about email campaigns, including the number of opens, clicks, and bounces. If you have old or inactive email campaigns, you can delete their statistics to reduce the size of this table.


SELECT
    COUNT(*)
FROM
    audit_log
WHERE
    date_added < DATE_SUB(NOW(), INTERVAL 6 MONTH);
+ ----------+
| COUNT(*) |
+ ----------+
| 18772735 | 
+ ----------+

DELETE FROM audit_log;


Page hits: The page_hits table contains information about page visits, including the date and time of the visit, the visitor's IP address, and the URL of the visited page. If you have a lot of page visit data in your database, you can delete old or unused page hits to reduce the size of this table.

SELECT
    COUNT(*)
FROM
    page_hits
WHERE
    date_hit < DATE_SUB(NOW(), INTERVAL 6 MONTH);

+ ----------+
| COUNT(*)  | 
+ ----------+
| 9384193   | 
+ ----------+
DELETE FROM page_hits WHERE date_hit < DATE_SUB(NOW(), INTERVAL 6 MONTH);

lead devices: The lead_devices table in Mautic is used to store information about the devices that are associated with a particular lead.

SELECT
    COUNT(*)
FROM
    lead_devices;
WHERE
    date_added < DATE_SUB(NOW(), INTERVAL 6 MONTH);



Some time delete the entry don't really shrink size for db, so what you can do is create a copy of old table insdead of delete:
-- Note that may need to disable foreign key by: SET FOREIGN_KEY_CHECKS=0; and set it back to one when finish

```
CREATE TABLE new_audit_log LIKE audit_log;
INSERT INTO new_audit_log SELECT * FROM audit_log WHERE date_hit >= DATE_SUB(NOW(), INTERVAL 6 MONTH);
DROP TABLE audit_log;
RENAME TABLE new_audit_log TO audit_log;
ANALYZE TABLE audit_log;

```
After all that, I found that the size of PVC still larger that I expected, so I rsh to the pod and found that  `ibdata1` still huge, based on this (artical)[https://stackoverflow.com/questions/3456159/how-to-shrink-purge-ibdata1-file-in-mysql], it won't shrink with db clean up
```
ls -lhS /var/lib/mysql/data/ | head
-rw-rw----. 1 1003560000 root 8.0G Mar 28 20:05 ibdata1
```

So follow this instraction, we need to dump the db and delete the pvc, recreate the pvc and restore the db! Luckily we have backup-container that can help us with this purpose. 

After all this is done, I found that the query speed is much faster, but the filesystem is pretty slow still, so just pumb the cpu request a little bit more to finally fix the issue




And this is the yaml file for mautci PVC:
```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: mautic-mariadb-data
  namespace: de0974-prod
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 30Gi
  volumeName: pvc-682b0ce5-a152-4213-86cd-94a83bb112a7
  storageClassName: netapp-file-standard
  volumeMode: Filesystem
status:
  phase: Bound
  accessModes:
    - ReadWriteOnce
  capacity:
    storage: 30Gi
```