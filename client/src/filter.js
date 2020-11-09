import React, { PureComponent } from 'react'
import { Card, InputGroup, Form, FormControl, Dropdown, Button,  DropdownButton, Collapse } from 'react-bootstrap'
import Select from 'react-select'
import PubSub from 'pubsub-js'

import { getLabels, getNodes } from './neo4j'


export default class Filter extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            collapse: false,
            labels: [],
            selectedLabels: [
                {value: "knowledge", label: "Knowledge"},
                {value: "tool", label: "Tool"},
                {value: "paper", label: "Paper"},
            ],
            options: [],
            selectedOptions: [{label: "Confluencer", value: "9", data: {}}],
            minHop: 1,
            maxHop: 11,
            fadingGradient: 0.02,
        }

        this.filter = {
            labels: this.state.selectedLabels.map(x => x.value),
            relatedNodes: ["9"],
            minMaxHop: [this.state.minHop, this.state.maxHop],
        }
        PubSub.publish('graph', {"do": "filter", "use": this.filter})

        getLabels(this)
        // getNodes(this, ["editor", "project"])
        getNodes(this) // just get all nodes, there is no need to limit
    }

    handleLabelsChange(selected) {
        // console.log("handleLabelsChange:", selected)
        this.setState({selectedLabels: selected})
        var labels = []
        if (selected) {
            for (const element of selected) {
                labels.push(element.value)
            }
        }
        this.filter["labels"] = labels
        PubSub.publish('graph', {"do": "filter", "use": this.filter})
    }

    handleOptionsChange(selected) {
        // console.log("handleLabelsChange:", selected)
        this.setState({selectedOptions: selected})
        var nodes = []
        if (selected) {
            for (const element of selected) {
                nodes.push(element.value)
            }
        }
        this.filter["relatedNodes"] = nodes
        PubSub.publish('graph', {"do": "filter", "use": this.filter})
    }

    handleMinHopChange(event) {
        // console.log("handleMinHopChange", event.target.value, this.state)
        var val = event.target.value
        if (val < 0 ) {val = 0}
        if (val > 1 ) {val = 1} // APOC: minLevel can only be 0 or 1 in subgraphAll()
        this.setState({minHop: val})
        const minMaxHop = [val, this.state.maxHop]
        this.filter["minMaxHop"] = minMaxHop
        PubSub.publish('graph', {"do": "filter", "use": this.filter})
    }

    handleMaxHopChange(event) {
        var val = event.target.value
        if (val < 0 ) {val = 0}
        this.setState({maxHop: val})
        const minMaxHop = [this.state.minHop, val]
        this.filter["minMaxHop"] = minMaxHop
        PubSub.publish('graph', {"do": "filter", "use": this.filter})
    }

    handleFadingGradient(event) {
        this.setState({fadingGradient: event.target.value})
        PubSub.publish('graph', {"do": "fadingGradient", "use": event.target.value})
    }

    render() {
        // console.log("render filter", this.state, this.filter)
        return (
            <div>
                <Card style={{border: "#d8cebc solid 2px"}}>
                <Card.Header onClick={() => {this.setState({collapse: !this.state.collapse})}} style={{height: "63px"}}>
                        <h5 style={{marginTop: "7px", float: "left", minWidth: "150px"}}>Filter and Settings</h5>
                    </Card.Header>
                    <Collapse in={!this.state.collapse} className={"p-0"}>
                        <Card.Body className="m-1" style={{height: window.innerHeight/1.3 - 8}}>

                            <br/>
                            <label>Types to include:</label>
                            <InputGroup className="p-1">
                                <div style={{width: '300px'}}>
                                    <Select
                                        isMulti
                                        // closeMenuOnSelect={false}
                                        value={this.state.selectedLabels}
                                        options={this.state.labels}
                                        // onFocus={this.handleClickSelect.bind(this)}
                                        onChange={this.handleLabelsChange.bind(this)}
                                    />
                                </div>
                            </InputGroup>
                            
                            <br/>
                            <label>Utilized by:</label>
                            <InputGroup className="p-1">
                                <div style={{width: '300px'}}>
                                    <Select
                                        isMulti
                                        // closeMenuOnSelect={false}
                                        value={this.state.selectedOptions}
                                        options={this.state.options}
                                        // onFocus={this.handleClickSelect.bind(this)}
                                        onChange={this.handleOptionsChange.bind(this)}
                                    />
                                </div>
                                <InputGroup>
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="basic-addon1" style={{width: "90px"}}> Min Hop</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <div style={{width: "90px"}}>
                                        <FormControl
                                            value={this.state.minHop}
                                            type="number"
                                            onChange={this.handleMinHopChange.bind(this)}
                                        />
                                    </div>
                                </InputGroup>
                                <InputGroup>
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="basic-addon1" style={{width: "90px"}}> Max Hop</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <div style={{width: "90px"}}>
                                        <FormControl
                                            value={this.state.maxHop}
                                            type="number"
                                            onChange={this.handleMaxHopChange.bind(this)}
                                        />
                                    </div>
                                </InputGroup>
                            </InputGroup>
                            
                            <br/>
                            <label>Fading Settings:</label>
                            <InputGroup className="p-1">
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="basic-addon1" style={{width: "90px"}}>Gradient</InputGroup.Text>
                                </InputGroup.Prepend>
                                <div style={{width: "90px"}}>
                                    <FormControl
                                        value={this.state.fadingGradient}
                                        type="number"
                                        step={0.01}
                                        onChange={this.handleFadingGradient.bind(this)}
                                    />
                                </div>
                            </InputGroup>
                        
                        </Card.Body>
                    </Collapse>
                </Card>
            </div>
        )
    }
}
