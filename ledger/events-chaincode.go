package main

/* Imports
* 4 utility libraries for handling bytes, reading and writing JSON,
formatting, and string manipulation
* 2 specific Hyperledger Fabric specific libraries for Smart Contracts
*/
import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// Define the Smart Contract structure
type SmartContract struct {
}

/* Define Events structure, with 4 properties.
Structure tags are used by encoding/json library
*/
type Events struct {
	Category  string `json:"category"`
	Name      string `json:"name"`
	Timestamp string `json:"timestamp"`
	Data      string `json:"data"`
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger
	if function == "queryEvents" {
		return s.queryEvents(APIstub, args)
	} else if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "recordEvents" {
		return s.recordEvents(APIstub, args)
	} else if function == "queryAllEvents" {
		return s.queryAllEvents(APIstub)
	} else if function == "getHistory" { //read history of a listing (audit)
		return getHistory(APIstub, args)
	}
	return shim.Error("Invalid Smart Contract function name.")
}

func (s *SmartContract) queryEvents(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	eventsAsBytes, _ := APIstub.GetState(args[0])
	if eventsAsBytes == nil {
		return shim.Error("Could not locate event")
	}
	return shim.Success(eventsAsBytes)
}

func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	events := []Events{
		Events{Category: "BR", Name: "Contract", Timestamp: "1504054221", Data: "xxx"},
		Events{Category: "ML", Name: "Active", Timestamp: "1504054225", Data: "yyyy"},
	}

	i := 0
	for i < len(events) {
		fmt.Println("i is ", i)
		eventsAsBytes, _ := json.Marshal(events[i])
		APIstub.PutState(strconv.Itoa(i+1), eventsAsBytes)
		fmt.Println("Added", events[i])
		i = i + 1
	}

	return shim.Success(nil)
}

func (s *SmartContract) recordEvents(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	var events = Events{Category: args[1], Name: args[2], Timestamp: args[3], Data: args[4]}

	eventsAsBytes, _ := json.Marshal(events)
	err := APIstub.PutState(args[0], eventsAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to record event : %s", args[0]))
	}

	return shim.Success(nil)
}

func (s *SmartContract) queryAllEvents(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "0"
	endKey := "999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add comma before array members,suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllEvents:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func getHistory(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	type AuditHistory struct {
		TxId  string `json:"txId"`
		Value Events `json:"value"`
	}
	var history []AuditHistory
	var listing Events

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	listingId := args[0]
	fmt.Printf("- start getHistoryForListing: %s\n", listingId)

	// Get History
	resultsIterator, err := stub.GetHistoryForKey(listingId)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	for resultsIterator.HasNext() {
		historyData, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		var tx AuditHistory
		tx.TxId = historyData.TxId                  //copy transaction id over
		json.Unmarshal(historyData.Value, &listing) //un stringify it aka JSON.parse()
		if historyData.Value == nil {               //listing has been deleted
			var emptyListing Events
			tx.Value = emptyListing //copy nil listing
		} else {
			json.Unmarshal(historyData.Value, &listing) //un stringify it aka JSON.parse()
			tx.Value = listing                          //copy listing over
		}
		history = append(history, tx) //add this tx to the list
	}
	fmt.Printf("- getHistory returning:\n%s", history)

	//change to array of bytes
	historyAsBytes, _ := json.Marshal(history) //convert to array of bytes
	return shim.Success(historyAsBytes)
}

/*
 * main function *
calls the Start function
The main function starts the chaincode in the container during instantiation.
*/
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
