// version that uses vis.js through react-graph-vis
// current state: hover event not working --> need to include vis-network.min.css, see https://github.com/crubier/react-graph-vis/issues/41
// also ugly nodes (need manual redesign) -> changed to react-force-graph library with more and easier option

import React, { PureComponent } from 'react'
import GraphVis from "react-graph-vis"

export default class Graph extends PureComponent {
    constructor(props) {
      super(props)

        this.state = {

        }

        this.viz = null
        this.graph = {
            nodes: [
              { id: 1, label: "Node 1", color: "#e04141", title: "node 1 tootip text" },
              { id: 2, label: "Node 2", color: "#e09c41" },
              { id: 3, label: "Node 3", color: "#e0df41" },
              { id: 4, label: "Node 4", color: "#7be041" },
              { id: 5, label: "Node 5", color: "#41e0c9" }
            ],
            edges: [{ from: 1, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 4 }, { from: 2, to: 5 }]
          };
          
          this.options = {
            interaction:{hover:true},
            layout: {
              hierarchical: true
            },
            edges: {
              color: "#000000"
            },
            height: "500px",
            width: "1000px"
          }
          
          this.events = {
            // select: function(event) {
            //     console.log("select:", event)
            // //   var { nodes, edges } = event;
            // //   console.log("Selected nodes:");
            // //   console.log(nodes);
            // //   console.log("Selected edges:");
            // //   console.log(edges);
            // },
            hover: function(event) {
                console.log("hoverNode:", event)
            }
          }
    }




    render() {
        console.log("render graph")

        return (
            <div id="Graph" style={{overflow: "hidden"}}>
                <GraphVis
                    graph={this.graph}
                    options={this.options}
                    events={this.events}
                    // style={{ height: "640px", width: 1000}}
                />
            </div>
        )
    }
}
