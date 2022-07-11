import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";
import Events from "./components/EventsComponent";
import AccoutInfo from "./components/AccoutInfo";

import "./App.css";

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
    addresses: null,
    inputValue: "",
    newEvents: [],
    pastEvents: [],
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      console.log(deployedNetwork);
      console.log(deployedNetwork && deployedNetwork.address);
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      const response = await instance.methods.get().call();

      let optionsNew = {
        filter: {
          value: [],
        },
        fromBlock: "latest",
      };

      instance.events.dataChanged(optionsNew).on("data", (event) => {
        console.log(event);
        this.setState({
          newEvents: [event, ...this.state.newEvents],
        });
      });

      let optionsPast = {
        filter: {
          value: [],
        },
        fromBlock: 0,
        toBlock: "latest",
      };

      instance.getPastEvents("dataChanged", optionsPast, (error, events) => {
        console.log("pastEvent");
        console.log(events);
        this.setState({
          pastEvents: events,
        });
      });

      //other method to get pastEvent
      // const listAddress = await instance.getPastEvents(
      //   "dataChanged",
      //   optionsPast
      // );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        storageValue: response,
        web3,
        accounts,
        contract: instance,
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Good to Go! address connnected is :</h1>
        <AccoutInfo address={this.state.accounts[0]} />
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <div>The stored value is: {this.state.storageValue}</div>
        <br></br>

        <div>
          <input
            type="text"
            id="inputValue"
            value={this.state.inputValue}
            onChange={(evt) => this.updateInputValue(evt)}
          ></input>
          <button onClick={this.onSubmit}>Set</button>
        </div>

        <div>
          <h2>New addresses which interact with the contract :</h2>
          <Events addresses={this.state.newEvents} />
        </div>
        <div>
          <h2>Past addresses which interact with the contract :</h2>
          <Events addresses={this.state.pastEvents} />
        </div>
      </div>
    );
  }

  onSubmit = async () => {
    //recup accounts, contrat et inputValue
    const { accounts, contract, inputValue } = this.state;
    // Interaction avec le smart contract pour set la valeur
    const transact = await contract.methods
      .set(inputValue)
      .send({ from: accounts[0] });

    //get event from transaction.0
    console.log(
      "Ladresse est  :" + transact.events.dataChanged.returnValues._addr
    );
    //lecture valeur
    const response = await contract.methods.get().call();
    //update du set -> maj auto de l'UI
    this.setState({ storageValue: response });
  };

  //update du state qui sera recup dans le onSubmit
  updateInputValue(evt) {
    const val = evt.target.value;
    this.setState({
      inputValue: val,
    });
  }
}

export default App;
