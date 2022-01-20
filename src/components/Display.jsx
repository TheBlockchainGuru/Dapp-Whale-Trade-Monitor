import React, {Component} from 'react';
import { Button,InputGroup, FormControl} from 'react-bootstrap';
import Web3 from 'web3';
import abiDecoder from  'abi-decoder'
import { abi } from './abi.js';
import  './Display.css';
import { MDBDataTable   } from 'mdbreact';
import { database } from './firebase/firebase'




const url = "wss://dawn-shy-voice.bsc.quiknode.pro/f929e892df513a1ad658ca2046aec0768f3817e5/";
const mWBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const mUsdt = "0x55d398326f99059ff775485246999027b3197955";
const mRouter = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const mLimit  = 3000;


export var rendertable;
const options = {
  timeout: 30000,
  clientConfig: {
    maxReceivedFrameSize: 100000000,
    maxReceivedMessageSize: 100000000,
  },
  reconnect: {
    auto: true,
    delay: 5000,
    maxAttempts: 15,
    onTimeout: false,
  },
};

var wsWeb3 = new Web3(new Web3.providers.WebsocketProvider(url, options));
var subscription = wsWeb3.eth.subscribe("pendingTransactions", (err, res) => {
});


const erc20abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}]

//0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F  sushiswap
//0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D  uniswap


class Display extends Component {
     
    constructor(props) {
         super(props)
         this.state = {
            fromAddresFilter : '',
            //------------
            ID : 0,
            toAddress : mRouter,
            wallet : '',
            timeStamp : 0,
            label : '',
            tokenIn : '',
            tokenInAddress: '',
            amountIn : 0,
            tokenOut : '',
            tokenOutAddress : '',
            amountOut : 0,
            payLoad :0,
            txHash : '',
            txHashLink : '',
            tokenIn_Decimals : 0,
            TokenOut_Decimals : 0, 
            //------------
            rating :0,
            //------------
            transactions : [],
            subscriptingstate : false
         }
     }
    

    async getRating () {
       let mycontract = new wsWeb3.eth.Contract(abi, this.state.toAddress)
       let rating  = await mycontract.methods.getAmountsOut(1000000000000, [mWBNB, mUsdt]).call();
       rating = rating / 1000000
       this.setState ({rating: rating[1]});
    }


    componentWillMount() {
        // await this.getRating()
    }

    async load(){
        database.ref('transactions/').get().then((snapshot) => {
            if (snapshot.exists) {
              var transaction = [];
                const newArray = snapshot.val();
                if (newArray) {
                    Object.keys(newArray).map((key, index) => {
                        const value = newArray[key];
                        transaction.push({
                            timeStamp : value.timeStamp,
                            label : value.label,
                            tokenIn : value.tokenIn,
                            amountIn : value.amountIn,
                            tokenOut : value.tokenOut,
                            amountOut : value.amountOut,
                            payLoad : value.payLoad,
                            wallet  : value.wallet,
                            txHash  : value.txhash
                        })
                    })
                }
                this.setState({
                transactions : transaction
              })
            }
        });
    }




    async init() {  
            this.setState({
                subscriptingstate : true
            })
            subscription.on("data", (txHash) => {
              setTimeout(async () => {
                if(this.state.subscriptingstate === false){
                    return
                }
                try {
                    
                    let tx = await wsWeb3.eth.getTransaction(txHash);
                    abiDecoder.addABI(abi);
                    var decodedData = abiDecoder.decodeMethod(tx.input);
                        if(tx.to === this.state.toAddress) {   
                
                                // let buffer = ture
                               if(decodedData["name"]==="swapExactTokensForETH"||decodedData["name"]==="swapTokensForExactETH"||decodedData["name"]==="swapExactTokensForETHSupportingFeeOnTransferTokens"||
                                  decodedData["name"]==="swapTokensForExactTokens"||decodedData["name"]==="swapExactTokensForTokens"||decodedData["name"]==="swapExactTokensForTokensSupportingFeeOnTransferTokens"||
                                  decodedData["name"]==="swapExactETHForTokens"||decodedData["name"]==="swapETHForExactTokens"||decodedData["name"]==="swapExactETHForTokensSupportingFeeOnTransferTokens")    
                               
                               {

                                    
                                    let transaction = {
                                        wallet : tx.from,
                                        timeStamp : new Date().toISOString(),
                                    }
                                    //----------------------------TokenforETH----------------------------------------
                                    if (decodedData["name"]==="swapExactTokensForETH"||decodedData["name"]==="swapExactTokensForETHSupportingFeeOnTransferTokens"){
                                        let MyContract = new wsWeb3.eth.Contract(erc20abi,decodedData["params"][2]["value"][0]);
                                        transaction.tokenIn = await MyContract.methods.symbol().call().then(function(res) {
                                            return res;
                                        })
                                        transaction.tokenIn_Decimals = await MyContract.methods.decimals().call()
                                        transaction.amountIn    =  decodedData['params'][0]['value'] / Math.pow(10,transaction.tokenIn_Decimals)
                                        transaction.tokenOut    = 'WETH'
                                        transaction.amountOut   = decodedData['params'][1]['value'] / Math.pow(10,18)
                                        await this.getRating();
                                        transaction.payLoad     = this.state.rating * transaction.amountOut
                                    } 
        
                                    else if (decodedData["name"]==="swapTokensForExactETH"){
                                        let MyContract = new wsWeb3.eth.Contract(erc20abi,decodedData["params"][2]["value"][0]);
                                        transaction.tokenIn = await MyContract.methods.symbol().call().then(function(res) {
                                            return res;
                                        })
                                        transaction.tokenIn_Decimals = await MyContract.methods.decimals().call()
                                        transaction.amountIn    = decodedData['params'][1]['value'] / Math.pow(10,transaction.tokenIn_Decimals)
                                        transaction.tokenOut    = 'WETH'
                                        transaction.amountOut   = decodedData['params'][0]['value'] / Math.pow(10,18)
                                        await this.getRating();
                                        transaction.payLoad     = this.state.rating * transaction.amountOut
                                    } 
                                    //-----------------------------------TokenForToken-------------------------------------------------------------------------------------------
                                    else if (decodedData["name"]==="swapExactTokensForTokensSupportingFeeOnTransferTokens"||decodedData["name"]==="swapExactTokensForTokens") {
                                        let MyContract =      await new wsWeb3.eth.Contract(erc20abi,decodedData["params"][2]["value"][0]);
                                        transaction.tokenIn = await MyContract.methods.symbol().call().then(function(res) {
                                            return res;
                                        })
                                        transaction.tokenIn_Decimals = await MyContract.methods.decimals().call()
                                        transaction.amountIn    = decodedData['params'][0]['value'] /Math.pow(10,transaction.tokenIn_Decimals)
                                        let MyContract1         = new wsWeb3.eth.Contract(erc20abi, decodedData['params'][2]['value'][(decodedData['params'][2]['value'].length)-1])
                                        transaction.tokenOut    = await MyContract1.methods.symbol().call().then(function(res) {
                                            return res
                                        })                               
                                        transaction.TokenOut_Decimals = await MyContract1.methods.decimals().call()
                                        transaction.amountOut   = decodedData['params'][1]['value'] / (Math.pow(10,transaction.TokenOut_Decimals))
                                        
                                        if(transaction.tokenIn === "WETH"||transaction.tokenIn ==="WBTC"||transaction.tokenOut === "WETH"||transaction.tokenOut =="WBTC"){
                                            return
                                        }
        
                                        if (transaction.tokenIn === "USDC"||transaction.tokenIn ==="USDT"){
                                            transaction.payLoad  =  transaction.amountIn
                                        }
                                        else if (transaction.tokenOut == "USDC"||transaction.tokenOut == "USDT"){
                                            transaction.payLoad  =  transaction.amountOut
                                        }  
                                        else{
                                            let mycontract2 = await new wsWeb3.eth.Contract(abi, this.state.toAddress)
                                            let pricearray   =  await mycontract2.methods.getAmountsOut(decodedData['params'][0]['value'], [decodedData["params"][2]["value"][0],'0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2']).call();
                                            transaction.payLoad =  pricearray[1] * this.state.rating /1000000000000000000
                                        }
        
                                    }  
                                   
                                    else if (decodedData["name"]=="swapTokensForExactTokens") {
        
                                        let MyContract =      await new wsWeb3.eth.Contract(erc20abi,decodedData["params"][2]["value"][0]);
                                        transaction.tokenIn = await MyContract.methods.symbol().call().then(function(res) {
                                            return res;
                                        })
                                        transaction.tokenIn_Decimals = await MyContract.methods.decimals().call()
                                        transaction.amountIn    = decodedData['params'][1]['value'] / Math.pow(10,transaction.tokenIn_Decimals)
                                        let MyContract1         = new wsWeb3.eth.Contract(erc20abi, decodedData['params'][2]['value'][(decodedData['params'][2]['value'].length)-1])
                                        transaction.tokenOut    = await MyContract1.methods.symbol().call().then(function(res) {
                                            return res
                                        })
                                        transaction.TokenOut_Decimals = await MyContract1.methods.decimals().call()
                                        transaction.amountOut   = decodedData['params'][0]['value'] / Math.pow(10,transaction.TokenOut_Decimals)
        
                                        if(transaction.tokenIn === "WETH"||transaction.tokenIn =="WBTC"||transaction.tokenOut === "WETH"||transaction.tokenOut ==="WBTC"){
                                            return
                                        }
                                        if (transaction.tokenIn === "USDC"||transaction.tokenIn =="USDT"){
                                            transaction.payLoad  =  transaction.amountIn
                                        }
                                        else if (transaction.tokenOut == "USDC"||transaction.tokenOut == "USDT"){
                                            transaction.payLoad  =  transaction.amountOut
                                        }
                                        else{
                                            
                                          
                                            let mycontract2 = await new wsWeb3.eth.Contract(abi, this.state.toAddress)
                                            let pricearray   = await mycontract2.methods.getAmountsOut( decodedData['params'][1]['value'], [decodedData["params"][2]["value"][0],'0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2']).call();
                                            transaction.payLoad =  pricearray[1] * this.state.rating /1000000000000000000
                                        }
                            
                                    }   
                            ////////////////////////////////////////////////////////Eth for token///////////////////////////////////////////////////////////////////////////////////////////              
                                    else if(decodedData["name"]=="swapExactETHForTokens"||decodedData["name"]==="swapETHForExactTokens"||decodedData["name"]==="swapExactETHForTokensSupportingFeeOnTransferTokens"){
                                        transaction.tokenIn     = 'WETH'
                                        transaction.amountIn    = tx.value / Math.pow(10,18)
        
                                        let MyContract  = new wsWeb3.eth.Contract(erc20abi, decodedData['params'][1]['value'][1])
                                        transaction.tokenOut    = await MyContract.methods.symbol().call().then(function (res) {
                                            return res
                                        })
        
                                        transaction.TokenOut_Decimals = await MyContract.methods.decimals().call()
                                        transaction.amountOut   = decodedData['params'][0]['value'] / Math.pow(10, transaction.TokenOut_Decimals)
                                        await this.getRating();
                                        transaction.payLoad     = transaction.amountIn   * this.state.rating
                                    }
                                    
                                    if (transaction.payLoad > mLimit) {
                                        transaction.ID        = this.state.ID + 1
                                        transaction.txHash    = tx.hash
                                        transaction.amountIn  = Math.round(transaction.amountIn * 100000) / 100000
                                        transaction.amountOut = Math.round(transaction.amountOut * 100000) / 100000
                                        transaction.payLoad   = "$"+Math.round(transaction.payLoad * 100)/ 100
                                        
                                        let transactions    = this.state.transactions
                                        
                                        transactions.push(transaction)
                                        this.setState(transaction);
            
                                        this.setState({
                                            transactions : transactions
                                        })
            
                                        const Insert_transaction = {
                                            timeStamp : transaction.timeStamp,
                                            wallet    : transaction.wallet,
                                            tokenIn   : transaction.tokenIn,
                                            amountIn  : transaction.amountIn,
                                            tokenOut  : transaction.tokenOut,
                                            amountOut : transaction.amountOut,
                                            txhash    : transaction.txHash,
                                            payLoad   : transaction.payLoad
                                        }
    
                                        var userListRef = database.ref('transactions')
                                        var newUserRef = userListRef.push();
                                        newUserRef.set(Insert_transaction);
                                    }

                        }
                    }
                    } catch (err) {
                }
            });
        });
    }

    async stop(){
        this.setState({
            subscriptingstate : false
        })
    }

    render () {
      var rows = []
    if(this.state.toAddress == mRouter){
         rows  = this.state.transactions.map((transaction) => {
            transaction.dexLink     = <a href="https://pancakeswap.finance/swap" target="_blank">Swap Interface</a>
            transaction.txHashLink  = <a href={"https://bscscan.com/tx/" + transaction.txHash} target="_blank">Click Here</a>
            return transaction
        })
    }


    const data = {
            columns : [

                {
                    label : 'Timestamp',
                    field : 'timeStamp',
                },
                {
                    label : 'wallet',
                    field : 'wallet',
                },
                {
                    label : 'Token In',
                    field : 'tokenIn',
                },
                // {
                //     label : 'Amount In',
                //     field : 'amountIn',
                // },
                {
                    label : 'Token Out',
                    field : 'tokenOut',
                },
                // {
                //     label : 'Amount Out',
                //     field : 'amountOut',
                // },
                {
                    label : 'Payload',
                    field : 'payLoad',
                },
                {
                    label : 'TX hash',
                    field : 'txHashLink',
                },
                {
                    label : 'Dex',
                    field : 'dexLink',
                },
            ],
            rows : rows,
    }
    const handleRouterAddress = (e) => {
            let toAddress  = e.target.value
            this.setState({
              toAddress : toAddress
            })
    }
        

    return (
            <div>
            <h2>MONITORED DEX SWAPS ( over ${mLimit} )</h2>
            <hr/><br/><br/>
            <InputGroup className="mb-2">
                <InputGroup.Text id="basic-addon3">
                    Pancakeswap Router Address
                </InputGroup.Text>
                <FormControl
                    placeholder={this.state.toAddress}
                    aria-label="Swap Address"
                    aria-describedby="basic-addon2"
                    defaultValue = {this.state.toAddress} 
                    onChange={handleRouterAddress}
                />
                <Button variant="success" id="button-addon2" onClick={()=>this.load()}>
                        Load from DB
                </Button>
                <Button variant={this.state.subscriptingstate ? "danger" : "primary"} id="button-addon2" onClick={this.state.subscriptingstate ?()=>this.stop():()=>this.init()}>
                        {this.state.subscriptingstate ? "Stop Monitor" : "Start Monitor"}
                </Button>

            </InputGroup>

            <br/>
            <MDBDataTable 
                striped
                bordered
                small
                data={
                    data
                }
            />
{/*            <p> Uniswap   Address : 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D </p>
            <p> Sushiswap Address : 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F</p>*/}
            </div>
        );
    }
}
export default Display;