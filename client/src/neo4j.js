// MATCH (n)-[r]->(m) RETURN n, TYPE(r), m

// import { neo4j } from 'neo4j-driver'
import { customAlphabet } from 'nanoid'
import {cloneDeep} from 'lodash'


// const host = 'bolt://localhost'
const host = 'bolt://141.30.136.185'
const port = '7687'
const relationType = 'DETAIL'

function parseInnerNode(node) {
    // console.log("parseInnerNode", node)
    // labels
    var label = ""
    if (node.labels) {
        label = node.labels[0]
    }
    // properties
    var pageRank = 0
    var name = ""
    var link = ""
    var creation = ""
    var update = ""
    var parent = ""
    var short = ""
    if (node.properties) {
        if (node.properties.pageRank) {
            pageRank = node.properties.pageRank
        }
        if (node.properties.name) {
            name = node.properties.name
        }
        if (node.properties.link) {
            link = node.properties.link
        }
        if (node.properties.creation) {
            creation = node.properties.creation
        }
        if (node.properties.update) {
            update = node.properties.update
        }
        if (node.properties.parent) {
            parent = node.properties.parent
        }
        if (node.properties.short) {
            short = node.properties.short
        }
    }

    const parsedNode = {
        "id": node.identity.low.toString(),// node.identity.high.toString() + node.identity.low.toString(),
        "pageRank": pageRank,
        "name": name,
        "label": label,
        "link": link,
        "creation": new Date(creation),
        "update": new Date(update),
        "parent": parent,
        "short": short,
    }
    // console.log("parseRecordToNode parsedNode:", parsedNode)
    return parsedNode
}
// takes in a single neo4j record and extracts the node properties
function parseRecordToNodes(record, column) {
    var nodes = record.get(column)
    // console.log("parseRecordToNodes", nodes, record, column)
    if (nodes == null) {return} // skip empty nodes
    if (!Array.isArray(nodes)) {nodes = [nodes]}
    var parsedNodes = []
    for (const node of nodes) {
        parsedNodes.push(parseInnerNode(node))
    }
    return parsedNodes
}

// takes in a single neo4j record and extracts the link properties
function parseRecordToLinks(record, column) {
    var links = record.get(column)
    // console.log("parseLinks", links)
    if (links == null) {return} // skip empty links
    if (!Array.isArray(links)) {links = [links]}
    var parsedLinks = []
    for (const link of links) {  
        if (link == null) {return null}

        var label = ""
        if (link.labels) {
            label = link.labels[0]
        }
        var name = ""
        if (link.properties && link.properties.name) {
            name = link.properties.name
        }

        const parsedLink = {
            "id": link.identity.low.toString(),// link.identity.high.toString() + link.identity.low.toString(),
            "source": link.start.low.toString(),// link.start.high.toString() + link.start.low.toString(),
            "target": link.end.low.toString(),// link.end.high.toString() + link.end.low.toString(),
        }
        parsedLinks.push(parsedLink)
    }
    // console.log("parsedRecordToLinks result:", parsedLinks)
    return parsedLinks
}

function parseRecordToLabel(record, column) {
    const labels = record.get(column)
    var label = ""
    if (labels) {
        label = labels[0]
    }
    return label
}

// checks if id of newElement already exists in elements
function checkIDInList(newElement, elements) {
    for (const element of elements) {
        if (newElement.id === element.id){
            return true
        }
    }
    return false
}

function parseGraph(component, results) {
    // console.log("parseGraph:", results)
    var nodes = []
    var links = []

    // handle response info
    if (results.summary.notifications.length > 0) {
        console.log("neo4j response info:", results.summary.notifications)
    }

    // access data
    for (const record of results.records) {
        // console.log("record:", record)
        const parsedNodes = parseRecordToNodes(record, 'n')
        for (const parsedNode of parsedNodes) {
            if (!checkIDInList(parsedNode, nodes)) {
                nodes.push(parsedNode)
            }
        }
        const parsedLinks = parseRecordToLinks(record, 'r')
        for (const parsedLink of parsedLinks) {
            if (!checkIDInList(parsedLink, links)) {
                links.push(parsedLink)
            }
        }

        // const link = parseRecordToLink(record, 'r')
        // if (link != null) {links.push(link)}

        // for (const link of links) {
        //     console.log("link:", link)
        // }
        // console.log("node, links", nodes, links)
    }

    const graph = {
        "nodes": nodes,
        "links": links
    }
    // console.log("graph:", graph)
    // for (const link of graph.links) {
    //     console.log("link:", link)
    // }
    // console.log("component", component)
    component.setState({graph: graph})
}

function createDriver() {
    var neo4j = require('neo4j-driver')
    var driver = neo4j.driver(
        host + ':' + port,
        // 'bolt://localhost:7687',
        // neo4j.auth.basic('', '')
    )
    // console.log("driver:", driver)
    return driver
}

function createSession(driver) {
    var session = driver.session()
    // console.log("session:", session)
    return session
}

function runQueries(session, queries) {
    // console.log("runQueries:", queries)
    const query = queries[0]
    session
        .run(query)
        .then((results) => {
            // results.records.forEach((record) => console.log(record))
            // console.log("results:", results)
            if (results.summary.notifications.length > 0) {
                console.log("neo4j response info:", results.summary.notifications)
            }
            if (queries.length > 1) {
                queries.shift()
                runQueries(session, queries)
            }
        })
        .catch(error => {
            console.log("runQuery:", query)
            console.log("runQueries error:", error)
        })
}

function parseNodes(results, component) {
    // console.log("parseNodes:", results)
    var nodes = [] // raw parsed nodes
    var creatorNodes = [] // special "value , labe, data" nodes for react-select

    // // handle response info
    // if (results.summary.notifications.length > 0) {
    //     console.log("neo4j response info:", results.summary.notifications)
    // }

    // access data
    for (const record of results.records) {
        // console.log("record:", record)
        const parsedNodes = parseRecordToNodes(record, 'n')
        for (const parsedNode of parsedNodes) {
            if (!checkIDInList(parsedNode, nodes)) {
                nodes.push(parsedNode)
            }
        }
    }

    for (const node of nodes) {
        // create elements for react-select
        const creatorNode = {
            value: node.id,
            label: node.name,
            data: node, // used to transfer whole data
        }
        creatorNodes.push(creatorNode)
    }

    // console.log("creatorNodes:", creatorNodes)
    component.setState({options: creatorNodes})
}

function parseNode(results, id, component) {
    // console.log("parseNode:", results, id)
    var node = null
    var parents = []
    var oldParents = []

    // // handle response info
    // if (results.summary.notifications.length > 0) {
    //     console.log("neo4j response info:", results.summary.notifications)
    // }

    // access data
    for (const record of results.records) {
        // console.log("record:", record)
        for (const key of record.keys) {
            const parsedNodes = parseRecordToNodes(record, key)
            if (!parsedNodes) {continue}
            for (const parsedNode of parsedNodes) {
                if (parsedNode.id === id) {
                    node = parsedNode
                } else {
                    parents.push({value: parsedNode.id, label: parsedNode.name})
                    oldParents.push(parsedNode.id)
                }
            }
        }
    }

    // console.log("parsed node:", node, parents, oldParents)
    component.setState({
        id: id,
        name: node.name,
        link: node.link,
        creation: node.creation,
        update: node.update,
        short: node.short,
        parents: parents,  // current parent relations
        oldParents: oldParents, // parent ids saved for comparison with parents
    })
}

function parseLabels(results, component) {
    var labels = []
    for (const record of results.records) {
        const parsed = parseRecordToLabel(record, 'labels(n)')
        const label = {
            value: parsed,
            label: parsed.charAt(0).toUpperCase() + parsed.slice(1),
        }
        labels.push(label)
    }
    component.setState({labels: labels})
}

// build query with filter options
// filter = {labels: [string], relatedNodeIDs [string]}
function createFilterQuery(filter) {
    // console.log("filterQuery:", filter)

    // match nodes
    var query = `MATCH (p)` //also includes single nodes
    if (filter && filter.relatedNodes && filter.relatedNodes.length !== 0) {
        query += ` WHERE ID(p)=` + filter.relatedNodes[0].replace(/(^0+)(.)/, '$2')
        for (const id of filter.relatedNodes.slice(1)) {
            query += ` OR ID(p)=` + id.replace(/(^0+)(.)/, '$2')
        }
    }

    // apply apoc subgraph
    // see: https://neo4j.com/docs/labs/apoc/current/graph-querying/expand-subgraph/
    query += ` CALL apoc.path.subgraphAll(p, {`
    if (filter && filter.labels && filter.labels.length !== 0) {
        query += `labelFilter: "` + filter.labels[0]
        for (const label of filter.labels.slice(1)) {
            query += `|` + label
        }
        query += `",`
    }
    if (filter && filter.minMaxHop && filter.minMaxHop.length !== 0) {
        query += ` minLevel: `+ filter.minMaxHop[0] +`, maxLevel: ` + filter.minMaxHop[1] + `})`
    } else {
        query += ` minLevel: 1, maxLevel: 2})`
    }
        query += ` YIELD nodes as n, relationships as r`

    return query
}

// to be called after a change to the data in neo4j
// updates page rank
// makes a backup
function updateNeo4j(session) {
    // console.log("updateNeo4j")
    var queries = []

    // update page rank
    //queries.push(`CALL gds.graph.create('pagerank_graph', '*', '*')`)
    var q = `CALL gds.graph.create.cypher('pagerank_graph', `
    q += `'MATCH (n) RETURN id(n) AS id', `
    q += `'MATCH (a)-[:DETAIL]->(b) RETURN id(b) AS source, id(a) AS target')`
    queries.push(q)
    queries.push(`CALL gds.pageRank.write('pagerank_graph', {maxIterations: 20, dampingFactor: 0.85, writeProperty:'pageRank'})`)
    queries.push(`CALL gds.graph.drop('pagerank_graph')`)

    // make a backup
    queries.push(`CALL apoc.export.json.all(replace(replace(replace(toString(datetime()),":","_"),"-",""),".","")+'_db_backup.json',{useTypes:true, storeNodeIds:false})`)

    runQueries(session, queries)
}

// retrieve all nodes and relations
// returns graph as {nodes, links} through component.setState({graph: ...})
// use filter to limit search
// filter is defined in filterQuery()
export function getGraph(component, filter) {
    // console.log("getData")

    var driver = createDriver()    
    var session = createSession(driver)

    var query = createFilterQuery(filter)
    query += ` RETURN n, r`
    // console.log("getGraphQuery:", query)

    session
        .run(query)
        .then((results) => {
            // results.records.forEach((record) => console.log(record))
            if (results.summary.notifications.length > 0) {
                console.log("neo4j response info:", results.summary.notifications)
            }
            parseGraph(component, results)
            session.close()
            driver.close()
        })
}

// - retrieve all nodes without relations
// - returns "option nodes" as {value, label, data} through setState({options: ...})
// - if [labels] has elements, only nodes with these labels are included
// - if [relatedNodes] includes node IDs, only nodes with relationship
//   to these nodes are included 
export function getNodes(component, filter) {
    var driver = createDriver()    
    var session = createSession(driver)

    var query = `MATCH (n) RETURN n`
    // console.log("getNodesQuery:", query)

    session
        .run(query)
        .then((results) => {
            // results.records.forEach((record) => console.log(record))
            if (results.summary.notifications.length > 0) {
                console.log("neo4j response info:", results.summary.notifications)
            }
            parseNodes(results, component)
            session.close()
            driver.close()
        })
}

// retrieve all properties and parent node ids for sepcific node id
export function getNode(component, id) {
    // console.log("getNode:", id)
    var driver = createDriver()    
    var session = createSession(driver)

    var query = `MATCH (n)`
    query += ` WHERE ID(n)=` + id.replace(/(^0+)(.)/, '$2') // delete leading zero, because api gets it wrong at 08
    query += ` OPTIONAL MATCH (m)-[r]->(n)`
    query += ` RETURN n, m`
    // console.log("getNodeQuery:", query)

    session
        .run(query)
        .then((results) => {
            // results.records.forEach((record) => console.log(record))
            if (results.summary.notifications.length > 0) {
                console.log("neo4j response info:", results.summary.notifications)
            }
            parseNode(results, id, component)
            session.close()
            driver.close()
        })
}

// retrieves all available labels from neo4j
// writes results back with component.setState({labels})
export function getLabels(component) {
    var driver = createDriver()    
    var session = createSession(driver)

    session
        .run(`MATCH (n) RETURN distinct labels(n)`)
        .then((results) => {
            if (results.summary.notifications.length > 0) {
                console.log("neo4j response info:", results.summary.notifications)
            }
            // console.log("getLabel results:", results)
            parseLabels(results, component)
            session.close()
            driver.close()
        })
        .catch(error => {
            console.error(error)
        })
}

export function createNode(type, node, parents) {
    // console.log("createNode:", type, node, parents)
    const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 5)
    var driver = createDriver()
    var session = createSession(driver)

    var query = ``
    var linkIDs = []
    const nodeID = nanoid()
    if (parents) {
        for (const parentID of parents) {
            const id = nanoid()
            linkIDs.push(id)
            query += ` MATCH (` + id + `) WHERE ID(` + id + `)=` + parentID.replace(/(^0+)(.)/, '$2')
        }
    }
    switch (type) {
        case "knowledge":
            query += ` MERGE (` + nodeID + `:knowledge {name: '` + node.Name + `', link: '` + node.Link + `'`
            query += `, creation: '` + node.Creation + `', update: '` + node.Update + `', short: '` + node.Short +`'})`
            break
        case "tool":
            query += ` MERGE (` + nodeID + `:tool {name: '` + node.Name + `', link: '` + node.Link + `'`
            query += `, creation: '` + node.Creation + `', update: '` + node.Update + `', short: '` + node.Short +`'})`
            break
        case "paper":
            query += ` MERGE (` + nodeID + `:paper {name: '` + node.Name + `', link: '` + node.Link + `'`
            query += `, creation: '` + node.Creation + `', update: '` + node.Update + `', short: '` + node.Short +`'})`
            break
        case "project":
            query += ` MERGE (` + nodeID + `:project {name: '` + node.Name + `', link: '` + node.Link + `'`
            query += `, creation: '` + node.Creation + `', update: '` + node.Update + `', short: '` + node.Short +`'})`
            break
        case "editor":
            query += ` MERGE (` + nodeID + `:editor {name: '` + node.Name + `', link: '` + node.Link + `'})`
            break
    }
    for (const id of linkIDs) {
        query += ` MERGE (` + id + `)-[:` + relationType + `]->(` + nodeID + `)`
    }
    // console.log("query:", query)
    if (query === ""){
        console.error("Empty query, probably node type not set correctly.")
        return
    }

    session
        .run(query)
        .then((results) => {
            // results.records.forEach((record) => console.log(record))
            // console.log("results:", results)
            if (results.summary.notifications.length > 0) {
                console.log("neo4j response info:", results.summary.notifications)
            }
            updateNeo4j(session)
            // session.close() // -> is done in updateNeo4j
            // driver.close() // -> is done in updateNeo4j
        })
        .catch(error => {
            console.error("query:", query)
            console.error("neo4j error:", error)
        })
}

export function updateNode(node) {
    // console.log("updateNode", node)
    const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 5)
    var driver = createDriver()    
    var session = createSession(driver)

    var properties = cloneDeep(node)
    delete properties.id
    delete properties.createParents
    delete properties.deleteParents
    var createLinks = []
    var deleteLinks = []
    const nodeID = nanoid()

    var query = `MATCH (` + nodeID + `) WHERE ID(` + nodeID + `)=` + node.id.replace(/(^0+)(.)/, '$2') // delete leading zeros, because api gets it wrong at 08
    if (node.createParents) {
        for (const parent of node.createParents) {
            // console.log("parent", parent)
            const id = nanoid()
            createLinks.push(id)
            query += ` MATCH (` + id + `) WHERE ID(` + id + `)=` + parent.replace(/(^0+)(.)/, '$2')
        }
    }
    if (node.deleteParents) {
        for (const parent of node.deleteParents) {
            const id = nanoid()
            deleteLinks.push(id)
            query += ` MATCH (n)-[` + id + `:` + relationType + `]->(m) WHERE ID(n)=` + parent.replace(/(^0+)(.)/, '$2') + ` AND ID(m)=` + node.id.replace(/(^0+)(.)/, '$2')
        }
    }
    query += ` SET ` + nodeID + ` += ` + JSON.stringify(properties)
    query = query.replace(/"([^"]+?)":/g, (m, g) => {return g + `:`})
    for (const id of createLinks) {
        query += ` MERGE (` + id + `)-[:` + relationType + `]->(` + nodeID + `)`
    }
    var first = true
    for (const id of deleteLinks) {
        if (first) {
            query += ` DELETE ` + id
            first = false
        } else {
            query += `, ` + id
        }
    }
    // console.log("query:", query)

    session
        .run(query)
        .then((results) => {
            // results.records.forEach((record) => console.log(record))
            // console.log("update results:", results)
            if (results.summary.notifications.length > 0) {
                console.log("neo4j response info:", results.summary.notifications)
            }
            updateNeo4j(session)
            // session.close() // -> is done in updateNeo4j
            // driver.close() // -> is done in updateNeo4j
        })
        .catch(error => {
            console.error(error)
        })
}

export function deleteNode(id) {
    // console.log("deleteNode")
    var driver = createDriver()    
    var session = createSession(driver)

    var query = `MATCH (n)`
    query += ` WHERE ID(n)=` + id.replace(/(^0+)(.)/, '$2') // delete leading zeros, because api gets it wrong at 08
    query += ` OPTIONAL MATCH (n)-[r]-()`
    query += ` DELETE n,r`

    session
        .run(query)
        .then((results) => {
            // results.records.forEach((record) => console.log(record))
            // console.log("delete results:", results)
            if (results.summary.notifications.length > 0) {
                console.log("neo4j response info:", results.summary.notifications)
            }
            updateNeo4j(session)
            // session.close() // -> is done in updateNeo4j
            // driver.close() // -> is done in updateNeo4j
        })
        .catch(error => {
            console.error(error)
        })
}
