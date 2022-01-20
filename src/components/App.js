import React, {Component} from 'react';
import { Tab, Col, Row, Nav } from 'react-bootstrap';
import TopNav from './TopNav.js';
import Web3 from 'web3';
import './App.css'
import Display from './Display.jsx';
import WalletList  from './WalletList.jsx';




class App extends Component {
    componentWillMount() {
        // if(window.ethereum) {
        //     window.web3 = new Web3(window.ethereum)
        //     await window.ethereum.enable()
        // } else if(window.web3) {
        //     window.web3 = new Web3(window.web3.currentProvider)
        // } else {
        //     window.alert('Non-Ethereum browser detected. Your should consider trying MetaMask!')
        // }
    }


    render () {
        return (
            <div>
                <TopNav />
                <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                    <br/><br/>
                <Row>
                    <Col xs="1">
                    <Nav variant="pills" className="flex-column" bg="light">
                        <Nav.Item>
                        <Nav.Link eventKey="first"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-graph-up" viewBox="0 0 16 16">
                                                   <path fillRule="evenodd" d="M0 0h1v15h15v1H0V0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5z"/>
                                                   </svg>    Monitor</Nav.Link>
                        </Nav.Item>
                        <br/><br/>
                    </Nav>
                    </Col>
                    <Col xs="11" md={{ span: 9 , offset:1 }}>
                    <Tab.Content>
                        <Tab.Pane eventKey="first">
                        <Display />
                        </Tab.Pane>
                    </Tab.Content>
                    </Col>
                </Row>
                </Tab.Container>
            </div>
        );
    }
}
export default App;