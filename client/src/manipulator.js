import React, { PureComponent } from 'react'
import { Card, InputGroup, Form, FormControl, Dropdown, Button,  DropdownButton, Collapse } from 'react-bootstrap'
import Select from 'react-select'
import PubSub from 'pubsub-js'

import { getNodes } from './neo4j'
import Knowledge from './knowledge'
import Tool from './tool'
import Paper from './paper'
import Project from './project'
import Editor from './editor'


export default class Manipulator extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            collapse: true,
            selected: null,
            node: null, //{id: "00", pageRank: 0, name: "Unicorn Knowledge", label: "knowledge", link: "https://en.wikipedia.org/wiki/Unicorn"},
            options: [],
        }

        getNodes(this)
        PubSub.subscribe('manipulator', this.onMessage.bind(this))
    }

    onMessage(topic,data) {
        // console.log("onMessage", topic, data)
        switch(data.do) {
            case "update":
                this.setState({collapse: true, selected: null, node: null})
                getNodes(this)
                break
        }
    }

    handleClickHeader() {
        this.setState({collapse: !this.state.collapse})
    }

    handleClickSelect() {
        // console.log("handleClickSelect")
        this.setState({collapse: false})
    }

    handleNodeChange(node) {
        // console.log("handleNodeChange:", node)
        this.setState({
            collapse: false,
            selected: node,
            node: node.data})
    }

    renderInput() {
        // console.log("renderInput:", this.state.node)
        if (!this.state.node) {return(<div>Please select a node.</div>)}
        switch(this.state.node.label) {
            case "knowledge":
                return(<Knowledge node={this.state.node.id}/>)
            case "tool":
                return(<Tool node={this.state.node.id}/>)
            case "paper":
                return(<Paper node={this.state.node.id}/>)
            case "project":
                return(<Project node={this.state.node.id}/>)
            case "editor":
                return(<Editor node={this.state.node.id}/>)
            default:
                return(<div>Unknown node (type).</div>)
        }
    }

    render() {
        // console.log("render manipulator", this.state.node)
        return (
            <div>
                <Card style={{border: "#d8cebc solid 2px"}}>
                <Card.Header onClick={() => {this.setState({collapse: !this.state.collapse})}} style={{height: "63px"}}>
                        <h5 style={{marginTop: "7px", float: "left", minWidth: "150px"}}>Edit Node</h5>
                        <Select
                            // closeMenuOnSelect={false}
                            value={this.state.selected}
                            options={this.state.options}
                            // onValueClick={(event) => {event.stopPropagation()}} //does not work
                            onFocus={this.handleClickSelect.bind(this)}
                            onChange={this.handleNodeChange.bind(this)}
                        />
                    </Card.Header>
                    <Collapse in={!this.state.collapse} className={"p-0"}>
                        <Card.Body className="m-1">
                            {this.renderInput.call(this)}
                        </Card.Body>
                    </Collapse>
                </Card>
            </div>
        )
    }
}