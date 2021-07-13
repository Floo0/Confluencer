import React, { PureComponent } from 'react'
import {Card, Collapse, Button, InputGroup, FormControl} from 'react-bootstrap'
import { ForceGraph2D } from 'react-force-graph'
import PubSub from 'pubsub-js'

import { getGraph, deleteNode } from './neo4j'


export default class Graph extends PureComponent {
    constructor(props) {
      super(props)

        this.state = {
            collapse: false,
            collapseLegend: false,
            graph: {
                "nodes": [ 
                    { 
                      "id": "00",
                      "name": "No",
                      "label": "knowledge",
                      "pageRank": 0.15,
                    },
                    { 
                      "id": "01",
                      "name": "Data",
                      "label": "knowledge",
                      "pageRank": 0.25,
                    },
                ],
                "links": [
                    {
                        "source": "00",
                        "target": "01",
                    },
                ]
            },
        }

        this.graphRef = React.createRef()
        this.filter = {
            labels: ["knowledge", "tool", "paper", "paper"],
        },
        this.colourType = {
            "knowledge": {h:359, s:85, l:60}, // red
            "tool": {h:120, s:60, l:60}, // green
            "paper": {h:225, s:75, l:60}, // blue
            "project": {h:185, s:60, l:60}, // light blue
            "editor": {h:40, s:90, l:60}, // yellow
            "data": {h:275, s:90, l:60}, // purple
        }
        this.search = ". . ."
        this.fadingGradient = 0.02

        PubSub.subscribe('graph', this.onMessage.bind(this))
    }

    onMessage(topic,data) {
        // console.log("onMessage", topic, data)
        switch(data.do) {
            case "reload":
                this.reloadGraph()
                break
            case "filter":
                this.filter = data.use
                this.reloadGraph()
                break
            case "fadingGradient":
                this.fadingGradient = data.use
                this.reloadGraph()
                break
        }
    }

    handleClickHeader() {
        // bad repositioning after collapse
        // -> disabled till fix
        // this.setState({collapse: !this.state.collapse})
    }

    handleOnNodeClick(node, event) {
        window.open(node.link, '_blank')
    }

    handleNodeRightClick(node, event) {
        // console.log("handleNodeRightClick:", node, event)
        // deleteNode(node.id)
        setTimeout(this.reloadGraph.bind(this), 500)
    }

    handleReload(event) {
        event.stopPropagation()
        this.reloadGraph()
    }

    handleSearchChange(event) {
        // event.stopPropagation()
        if (event.target.value === "") {
            this.search = event.target.placeholder
            // this.setState({search: event.target.placeholder})
        } else {
            this.search = event.target.value
            // this.setState({search: event.target.value})
        }
    }

    // used to reload graph if data changed (after some action with neo4j)
    reloadGraph() {
        // console.log("reloadGraph", this.filter)
        this.search = ". . ."
        getGraph(this, this.filter)
    }

    parseNodeLabel(data) {
        // console.log("parseNodeLabel:", data)
        var label = "<b>Name: </b>" + data.name
        label += "<br><b>Short Description:</b><br>" + data.short
        label += "<br>"
        label += "<br><b>ID: </b>" + data.id
        label += "<br><b>Page Rank: </b>" + data.pageRank
        // label += "<br><b>Label: </b>" + data.label
        label += "<br><b>Link: </b>" + data.link
        
        return label
    }

    renderNode(node, ctx, currentGlobalScale, isShadowContext) {
        // console.log("renderNode:", this, node, ctx, currentGlobalScale, isShadowContext)
        // console.log("renderNode", node)

        // draw nodes, node shape -> circle
        var rad = 1
        if (node.pageRank !== 0) {
            // rad = (1/node.pageRank + rad)/2
            rad = (node.pageRank*15 + rad)/1.3
        }

        // highlight node if searched for (in graph header)
        if (node.name.toLowerCase().includes(this.search.toLowerCase())) {
            const d = new Date()
            const sec = d.getMilliseconds()/1000 + d.getSeconds() % 3
            ctx.beginPath()
            // arc -> (x, y, radius, startAngle, endAngle [, anticlockwise])
            // see also: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc
            ctx.arc(node.x, node.y, rad*1.0 + 1.0*sec, 0, 2 * Math.PI, false)
            ctx.fillStyle = "hsl(300, 75%, 60%)"
            ctx.fill()
        }

        // draw normal node
        var diffTime = 0
        // filter out invalid and not available dates
        if (node.hasOwnProperty("update") && node.update instanceof Date && !isNaN(node.update)) {
            diffTime = Math.abs(Date.now() - node.update)
        }
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        ctx.beginPath()
        ctx.arc(node.x, node.y, rad, 0, 2 * Math.PI, false)
        ctx.fillStyle = "hsl(300, 75%, 60%)" // if none matches
        if (node.label in this.colourType) {
            const colour = this.colourType[node.label]
            // version 31.08.2020:
            // const colourDiffDays = Math.round(45/(1+Math.exp(-0.05*(diffDays-20)))) + 50 
            // version 09.11.2020:
            // const colourDiffDays = Math.round(45/(1+Math.exp(-0.07*(diffDays-50)))) + 50// 45/(1+e^(-0.07*(x-50)))+50, x=[-100,100]
            const offset = 3.64/this.fadingGradient
            const colourDiffDays = Math.round(45/(1+Math.exp(-this.fadingGradient*(diffDays-offset)))) + 50// 45/(1+e^(-0.07*(x-50)))+50, x=[-100,100]
            // if (node.label ==="editor") {console.log("colour:", "hsl(" + colour.h + ", " + colour.s + "%, " + colourDiffDays + "%)")}
            ctx.fillStyle = "hsl(" + colour.h + ", " + colour.s + "%, " + colourDiffDays + "%)"
        }
        ctx.fill()

        // node label - name
        const maxLength = 37
        var label = node.name.slice(0, maxLength)
        if (node.name.length > maxLength) {label += `...`}
        // const fontSize = 12/currentGlobalScale // standard 12pt, scale independent
        const fontSize = 3 + 3/currentGlobalScale * (rad*0.5+0.5) // 7/currentGlobalScale + currentGlobalScale*2
        const offset = rad*(currentGlobalScale + 65)/100 + 1
        // const textWidth = ctx.measureText(label).width
        // const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding
        //# label background
        // ctx.fillStyle = 'hsl(0, 0%, 100%)'
        // ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions)
        //# text
        ctx.fillStyle = 'hsl(0, 0%, 0%)'
        ctx.font = `${fontSize}px Sans-Serif`
        ctx.fillText(label, node.x + offset, node.y - offset)
        // link props
    }

    renderLegend() {
        // console.log("renderLegend", this.filter)
        var items = []
        for (const [key, value] of Object.entries(this.colourType)) {
            if (this.filter.labels.includes(key)) {
                const name = key.charAt(0).toUpperCase() + key.slice(1)
                const colourStr = "hsl(" + value.h + ", " + value.s + "%, " + value.l + "%)"
                items.push(<li key={key} style={{color: colourStr}}>{name}</li>)
            }
        }
        return items
    }

    // componentDidMount() {
    //     this.reloadGraph()
    // }

    componentDidUpdate() {
        this.graphRef.current.zoom(0.2, 0)
        this.graphRef.current.zoom(2.0, 1000)
    }

    render() {
        // console.log("render graph", this.state.graph)
        // for (const node of this.state.graph.nodes) {
        //     console.log("node:", node)
        // }
        // for (const link of this.state.graph.links) {
        //     console.log("link:", link)
        // }
        
        return (
            <div id="Graph" style={{overflow: "hidden"}}>
                <Card style={{border: "#d8cebc solid 2px"}}>
                    <Card.Header onClick={this.handleClickHeader.bind(this)} style={{height: "63px"}}>
                            <h5 style={{marginTop: "7px", float: "left", minWidth: "80px"}}>Graph</h5>
                            <div className="float-right" style={{display: "flex"}}>
                                <InputGroup className="mr-4">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="basic-addon1" style={{width: "80px"}}>Search</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl
                                        placeholder={this.search}
                                        // aria-label="Username"
                                        // aria-describedby="basic-addon1"
                                        onChange={this.handleSearchChange.bind(this)}
                                        onClick={(event) => {event.stopPropagation()}}
                                    />
                                </InputGroup>
                                <Button variant="secondary" onClick={this.handleReload.bind(this)}>Reload</Button>
                            </div>
                    </Card.Header>
                    <Collapse in={!this.state.collapse} className="p-0">
                        <div>
                            <ForceGraph2D
                                ref={this.graphRef}
                                graphData={this.state.graph}
                                // width={1000}
                                // width={window.innerWidth/1.3}
                                // height={700}
                                height={window.innerHeight/1.3}
                                linkDirectionalArrowLength={5}
                                linkWidth={2}

                                // interaction
                                onNodeClick={this.handleOnNodeClick.bind(this)}
                                onNodeRightClick={this.handleNodeRightClick.bind(this)}
                                onNodeDragEnd={node => {
                                    node.fx = node.x;
                                    node.fy = node.y;
                                    node.fz = node.z;
                                  }} // fix node after dragging

                                // force engine
                                d3AlphaMin={0.0} // 0.2 -> 0: nodes can be moved forever (other nodes will react)
                                d3AlphaDecay={0.0228} // 0.03
                                d3VelocityDecay={0.2} // 0.2, 0.07
                                // warmupTicks={100}

                                // rendering
                                nodeRelSize={11}
                                nodeLabel={this.parseNodeLabel.bind(this)}
                                nodeCanvasObject={this.renderNode.bind(this)}
                            />
                            <Card className="p-1 m1" style={{position: "absolute", bottom: "0", right: "0", border: "#d8cebc solid 2px"}}
                                    onClick={()=>{this.setState({collapseLegend: !this.state.collapseLegend})}}>
                                <div>Legend</div>
                                <Collapse className="p-0" in={!this.state.collapseLegend}>
                                    <div>
                                        {this.renderLegend.call(this)}
                                    </div>
                                </Collapse>
                            </Card>
                        </div>
                    </Collapse>
               </Card>
            </div>
        )
    }
}
