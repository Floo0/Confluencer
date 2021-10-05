# Confluencer
Server for docker environment running neo4j as database and niginx to host Confluencer website. Confluencer helps to manage confluence spaces through great visual representation.

## Forward Port (to Confluence)
sudo iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8090
sudo iptables -I INPUT -p tcp --dport 8090 -j ACCEPT
