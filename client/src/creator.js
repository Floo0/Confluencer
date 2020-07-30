import React, { PureComponent } from 'react'
import { Card, InputGroup, Form, FormControl, Dropdown, Button,  DropdownButton, Collapse } from 'react-bootstrap'

import Knowledge from './knowledge'
import Tool from './tool'
import Paper from './paper'
import Project from './project'
import Editor from './editor'


export default class Creator extends PureComponent {
    constructor(props) {
        super(props)

        this.types = ["Knowledge", "Tool", "Paper", "Project", "Editor"]

        this.state = {
            collapse: true,
            type: "Select...",
        }

        PubSub.subscribe('creator', this.onMessage.bind(this))
    }

    onMessage(topic,data) {
        // console.log("onMessage", topic, data)
        switch(data.do) {
            case "update":
                this.setState({collapse: true, type: "Select..."})
                break
        }
    }

    renderTypeDropdown() {
        var items = []
        var i = 0
        for (let type of this.types.sort()) {
            items.push(<Dropdown.Item  key={i} eventKey={type}>{type}</Dropdown.Item>)
            i++
        }
        return items
    }

    renderInput() {
        // console.log("renderInput:", this)
        switch (this.state.type) {
            case "Knowledge":
                return <Knowledge/>
            case "Tool":
                return <Tool/>
            case "Paper":
                return <Paper/>
            case "Project":
                return <Project/>
            case "Editor":
                return <Editor/>
            default:
                return <div>Please select a node type.</div>
        }
    }
     
    render() {
        // console.log("render creator", this.state)
        return (
            <div>
                <Card style={{border: "#d8cebc solid 2px"}}>
                    <Card.Header onClick={() => {this.setState({collapse: !this.state.collapse})}} style={{height: "63px"}}>
                        <h5 style={{marginTop: "7px", float: "left"}}>Create New Node</h5>
                        <DropdownButton  className="float-right" 
                            variant="secondary"
                            title={this.state.type}
                            id="input-group-dropdown-1"
                            onClick={(event) => {event.stopPropagation()}}
                            onSelect={(value) => {this.setState({type: value, collapse: false})}}
                        >
                            {this.renderTypeDropdown.call(this)}                                   
                        </DropdownButton>
                    </Card.Header>
                    <Collapse in={!this.state.collapse} className={"p-0"}>
                        <Card.Body className="m-1">
                            {this.renderInput()}
                        </Card.Body>
                    </Collapse>
                </Card>
            </div>
        )
    }
}