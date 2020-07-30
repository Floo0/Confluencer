// index.js
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import {Navbar, Nav, Row, Col, Button,ButtonToolbar} from 'react-bootstrap'
import { cloneDeep } from 'lodash'

import Graph from './graph'
import Creator from './creator'
import Manipulator from './manipulator'
import Filter from './filter'


class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            hide: {
                graph: false, // true,
                creator: false,
                manipulator: false,
            }
        }
    }

    selectGraph(tab) {
        var hide = cloneDeep(this.state.hide)
        hide[tab] = !hide[tab]
        this.setState({hide: hide})
    }
 
    render() {
        // console.log("render index")
        return (
            <div>
                <Navbar bg="dark" variant="dark">
                    <Nav style={{color: "#fff", backgrounColor: "#343a40"}}>
                        <Navbar.Brand className="px-3 py-2">Confluencer</Navbar.Brand>
                        <Nav.Link style={{color: this.state.hide.graph? "rgba(255,255,255,.5)": "rgba(255,255,255,0.9)",
                            paddingTop: "0.83em", fontWeight: this.state.hide.graph? "normal": "bold"}} 
                            onSelect={this.selectGraph.bind(this, 'graph')} eventKey="main">Graph</Nav.Link>
                        <Nav.Link style={{color: this.state.hide.filter? "rgba(255,255,255,.5)": "rgba(255,255,255,0.9)",
                            paddingTop: "0.83em", fontWeight: this.state.hide.filter? "normal": "bold"}} 
                            onSelect={this.selectGraph.bind(this, 'filter')} eventKey="main">Filter</Nav.Link>
                        <Nav.Link style={{color: this.state.hide.creator? "rgba(255,255,255,.5)": "rgba(255,255,255,0.9)",
                            paddingTop: "0.83em", fontWeight: this.state.hide.creator? "normal": "bold"}} 
                            onSelect={this.selectGraph.bind(this, 'creator')} eventKey="main">Creator</Nav.Link>
                        <Nav.Link style={{color: this.state.hide.manipulator? "rgba(255,255,255,.5)": "rgba(255,255,255,0.9)",
                            paddingTop: "0.83em", fontWeight: this.state.hide.manipulator? "normal": "bold"}} 
                            onSelect={this.selectGraph.bind(this, 'manipulator')} eventKey="main">Manipulator</Nav.Link>
                    </Nav>
                </Navbar>
                <Row className="m-0 p-0">
                    <Col className="m-0 p-0" md={9} hidden={this.state.hide.graph}>
                        <Graph/>
                    </Col>
                    <Col className="m-0 p-0" md={3} hidden={this.state.hide.filter}>
                        <Filter/>
                    </Col>
                </Row>
                <Row className="m-0 p-0">
                    <Col className="m-0 p-0" hidden={this.state.hide.creator}>
                        <Creator/>
                    </Col>
                    <Col className="m-0 p-0" hidden={this.state.hide.manipulator}>
                        <Manipulator/>
                    </Col>
                </Row>
            </div>
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('app')
);