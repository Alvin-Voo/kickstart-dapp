import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined'){
  //We are in the browser and metamask is running
  web3 = new Web3(window.web3.currentProvider);//assigning Metamask web3 instance's provider to this web3
}else{
  //We are on the server *OR* the user is not running metamask
  // const provider = new Web3.providers.HttpProvider(
  //   'https://rinkeby.infura.io/zrgEHIcGzfZ3LHNoemSE'
  // );

  const provider = new Web3.providers.WebsocketProvider(
    'wss://rinkeby.infura.io/ws'
  );

  web3 = new Web3(provider);
}

export default web3;
