# Cypher Queries
<pre>
# create a new database https://neo4j.com/developer/manage-multiple-databases/ only in enterprise edition
create database testdb

# show all nodes and relations --> but only in neo4j browser
MATCH (n) RETURN (n)

# get all nodes and relations (http- api)
"MATCH (n) OPTIONAL MATCH (n)-[r]-() RETURN n, r"

# get nodes and relation types
MATCH (n)-[r]->(m) RETURN n, TYPE(r), m

# delete all nodes
MATCH (n) DETACH DELETE n
</pre>


# Backup

## Export
Automatically done via APOC call  
`CALL apoc.export.json.all(replace(replace(replace(toString(datetime()),":","_"),"-",""),".","")+'_db_backup.json',{useTypes:true, storeNodeIds:false})`  
&rarr; If permission is denied, change folder permission (in particular for Confluencer/neo4j/backup from root to "user").  
&rarr; Probably needs restart of neo4j-container (`docker-compose restart neo4j`).

## Import
Open `<host>:7474/browser/` 
`CALL apoc.import.json('20201202T09_24_01485Z_db_backup.json')`
