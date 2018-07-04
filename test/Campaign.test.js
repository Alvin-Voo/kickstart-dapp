const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');//this will return a constructor function

const provider = ganache.provider();//this is the provider to the network
const web3 = new Web3(provider);//can make multiple instances

const compiledFactory = require('../ethereum/build/CampaignFactory');
const compiledCampaign = require('../ethereum/build/Campaign');

let accounts;
let factory; //an instance of factory contract
let campaignAddress;
let campaign; //an instace of campaign contract

beforeEach(async () =>{
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
  .deploy({data: compiledFactory.bytecode})
  .send({from: accounts[0], gas: '1000000'});

  await factory.methods.createCampaign('100').send({
    from: accounts[0],
    gas: '1000000'
  });

  [campaignAddress] = await factory.methods.getDeployedCampaign().call();
  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress
  );
});

describe('Campaigns', ()=>{
  it('deploys a factory and a campaign', ()=>{
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it('marks callers as the campaign manager', async()=>{
    const manager = await campaign.methods.manager().call();

    assert.equal(manager,accounts[0]);
  });

  it('allows people to contribute money and marks them as approvers', async()=>{
    await campaign.methods.contribute().send({
      value: '200',
      from: accounts[1]
    });
    const isContributor = await campaign.methods.approvers(accounts[1]).call();
    assert(isContributor);
  });

  it('requires a minimum contribution', async() =>{
    try{
      await campaign.methods.contribute().send({
        value:'50',
        from: accounts[1]
      });
      assert(false);
    }catch(e){
      assert(e);
    }
  });

  it('allows a manager to make a payment request', async() =>{
    await campaign.methods
    .createRequest('Buy biscuits','100',accounts[2])
    .send({
      from: accounts[0],
      gas: '1000000'
    });
    const request = await campaign.methods.requests(0).call();

    assert(request.description);
    assert(request.value);
    assert(request.recipient);
  });

  it('processes requests', async()=>{
    //some contributors
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: web3.utils.toWei('10','ether')
    });

    await campaign.methods.contribute().send({
      from: accounts[2],
      value: web3.utils.toWei('5','ether')
    });

    await campaign.methods.contribute().send({
      from: accounts[3],
      value: web3.utils.toWei('8','ether')
    });

    //manager creates campaign
    await campaign.methods
    .createRequest('A',web3.utils.toWei('5','ether'),accounts[8])
    .send({from:accounts[0],gas:'1000000'});
    //get the supplier balance before anything
    const accBal = await web3.eth.getBalance(accounts[8]);

    //contributors approves request
    await campaign.methods.approveRequest(0).send({
      from: accounts[1],
      gas: '1000000'
    });

    //try to finalize with one approver
    try{
      await campaign.methods.finalizeRequest(0).send({
        from: accounts[0],
        gas: '1000000'
      })
      assert(false);
    }catch(e){
      assert(e);
    }

    //another guy approves
    await campaign.methods.approveRequest(0).send({
      from: accounts[2],
      gas: '1000000'
    });

    //should success
    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: '1000000'
    });

    const accBal_aft = await web3.eth.getBalance(accounts[8]);
    const diff = web3.utils.fromWei(web3.utils.toBN(accBal_aft-accBal),'ether');

    assert.equal(diff,'5');
  })
})
