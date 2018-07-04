import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';
//deployed address in Rinkeby Testnet
const address = '0x9B7dF1716f9c7CCf747707177982bD96D66bF237';

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  address
);

export default instance;
