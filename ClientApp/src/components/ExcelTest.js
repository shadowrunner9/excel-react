import React, { Component , useCallback } from 'react';
import {useState, useMemo, useEffect} from 'react';
//import { RouteComponentProps } from 'react-router';  
//import { Link, NavLink } from 'react-router-dom'; 
//import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
//import IconButton from '@material-ui/core/IconButton';
import ReactTable from 'react-table-v6';
import 'react-table-v6/react-table.css';
import { ExportToCsv } from 'export-to-csv';
import { handleResponse, requestBase } from '../_helpers/fetch-helpers';
//import PBDTable from './PBDTable';


export class ExcelTest extends React.Component{
  state = {
    mainState: "initial",
    selectedFile: null,
    loading: true,
      DispoList: [],
    status: "Upload a file of IDs to pull info from the database."
  };
  static displayName = ExcelTest.name;
//    uploadInput!: File;
//    fileName: any;


  componentDidMount() {
  //  this.populateExcelData();
  }

  static renderExcelTable(DispoList) {
    //DispoList: { date: string; onlineId: string; }[]) {
  /*  return (
      <table className='table table-striped' aria-labelledby="tabelLabel">
        <thead>
          <tr>
            <th>Date Received</th>
            <th>Online ID</th>
            <th>Disposition</th>
            <th>PI Complete Date</th>
            <th>Eligibility</th>
            <th>Previous Status</th>
            <th>Vendor Note</th>
           </tr>
        </thead>
        <tbody>
          {DispoList.map((Excel_Id) =>//: { date: string; onlineId: string; }) =>
            <tr key={Excel_Id.onlineId}>
              <td>{Excel_Id.date}</td>
              <td>{Excel_Id.onlineId}</td>
              <td>Complete - In Process</td>
              <td>{Excel_Id.interviewCompleteDate}</td>
              <td>{Excel_Id.escalationRule}</td>
              <td>{Excel_Id.pbstatus}</td>
              <td>{Excel_Id.onlineId}</td>
            </tr>
          )}
        </tbody>
      </table>
    );*/
  }


  onUpload = () => {
    console.log(this.fileName);
    this.setState({ DispoList: this.fileName, loading: false });
  }
  handleUploadClick = event => {
    console.log(event.target.files[0]);
    var file = event.target.files[0];
    const reader = new FileReader();
    var url = reader.readAsDataURL(file);

    reader.onloadend = function(e) {
      var contents = reader.result;
      const form_Data = new FormData();
      console.log("file content:" + contents);
      this.setState({
        mainState: "uploaded",
        selectedFile: reader.result,
        loading: false
        });
//      data.append(file.name, contents);
      form_Data.append("FormFile", file); // file, not contents!
      form_Data.append("FileName", file.name);  
      console.log(...form_Data);
      console.log(new Response(form_Data).text());
      this.uploadFile(form_Data);  //reader.result);
    }.bind(this);
    console.log(file); 

    reader.onerror = function(event) {
      console.error("File could not be read! Code " + reader.error.code);
    };    
  };

  handleExport = event => { // export datatable to excel
    const ex_options ={
      fieldSeparator: ',',
      filename: 'PBDispo_export',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true, 
      showTitle: false,
      title: 'My Export CSV',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,  
    }
    const csvExporter = new ExportToCsv(ex_options);

    csvExporter.generateCsv(this.state.DispoList);
  }

  setComplete = event => {  // call API to set IDs to complete
    this.processData();
  };

  render() {
    let contents = this.state.loading
      ? <p><em>Awaiting file...</em></p>
      : ExcelTest.renderExcelTable(this.state.DispoList);

    const columns = [
        {
          Header: "Date Received",
          accessor: 'date'
        },
        {
          Header: "Online ID",
          accessor: 'onlineId'
        },
/*        {
          Header: "Disposition",
          accessor: "Complete - In Process"
        },*/
        {
          Header: "Complete Date",
          accessor: 'interviewCompleteDate'
        },
        {
          Header: "Eligibility",
          accessor: 'escalationRule'
        },
        {
          Header: "Previous Status",
          accessor: 'pbstatus'
        },
        {
          Header: "Vendor Note",
          accessor: "???"
        },
        {
            Header: "Pass / Fail",
            accessor: 'passFail'
        }
      ]
    
    
    return (
      <div id="row1">
        <div display='inline-block' class="button-container" className="'& > *': {margin: theme.spacing(1),},">
          <input
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            className="display: none"
            hidden
            id="contained-button-file"
            multiple
            type="file"
            ref={this.fileName} 
            onChange={this.handleUploadClick}
          />
          <label htmlFor="contained-button-file">
            <Button variant="contained" color="primary" component="span">
              Upload
            </Button>
          </label>
            <label htmlFor="export-button">
              <Button variant="outlined" color="primary" component="span" onClick={this.handleExport}>
                Export
              </Button>
            </label>
          <div style={{float: 'right'}}>
            <label htmlFor="process-button">
              <Button variant="contained" color="secondary" component="span" onClick={this.setComplete}>
                Set Complete
              </Button>
            </label>
          </div>
        </div>
        <p>Status: {this.state.status}</p>
        <ReactTable data={this.state.DispoList} columns={columns} showPagination={false} minRows={5} pageSize={this.state.DispoList.length} />
      </div>
    );
  }

  async populateExcelData() {
    const response = await fetch('/api/Excel/Index');
    const data = await response.json();
    //const data = [{ mricode: "mricode-test", date: "Today", summary: "fetch?" },{ mricode: "mricode-test2", date: "yesterday", summary: "wrtch?" }]
    this.setState({ DispoList: data, loading: false });
  }


  async uploadFile(updata) {
    const tmp_data = [{ onlineId: "Loading...", date: "Today", summary: "fetch?" }]
    this.setState({ DispoList: tmp_data, loading: false });
    console.log(...updata); 
    const response = await fetch('/api/Excel/load', {
        method: 'POST',
        body: updata,
    });
    const data = await response.json();
    console.log(data);
      if (data.ids != null)
          this.setState({ DispoList: data.ids, status: data.message, loading: false });
      else
          this.setState({ status: data.message, loading: false });
  }

  async processData() {
      const response = await fetch('/api/Excel/process', {
          method: 'POST',
      });
    const data = await response.json();
    //const data = [{ mricode: "mricode-test", date: "Today", summary: "fetch?" },{ mricode: "mricode-test2", date: "yesterday", summary: "wrtch?" }]
      if( data.ids != null)
          this.setState({ DispoList: data.ids, status: data.message, loading: false });
      else
          this.setState({ status: data.message, loading: false });
  }

}
