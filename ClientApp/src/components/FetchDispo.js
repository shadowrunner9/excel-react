import React, { Component } from 'react';
//import { RouteComponentProps } from 'react-router';  
//import { Link, NavLink } from 'react-router-dom';  
import { handleResponse, requestBase } from '../_helpers/fetch-helpers';

/*interface DispoProps {
//  onClick: Function;
  DispoList: { onlineId: string; date: string; sirmid: string; }[];
}

interface FetchDispoDataState {
  DispoList: { onlineId: string; date: string; sirmid: string; }[];
  loading: Boolean;
}*/
export class FetchDispo extends React.Component{
  static displayName = FetchDispo.name;

  constructor(props: DispoProps) {
    super(props);
    this.state = { DispoList: [], loading: true };
  }

  componentDidMount() {
      this.getShieldData();
  }

  static renderForecastsTable(DispoList) {
    return (
      <table className='table table-striped' aria-labelledby="tabelLabel">
        <thead>
          <tr>
            <th>Date Received</th>
            <th>Online ID</th>
            <th>Status</th>
            <th>Complete Date</th>
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
    );
  }

  render() {
    let contents = this.state.loading
      ? <p><em>Loading...</em></p>
      : FetchDispo.renderForecastsTable(this.state.DispoList);

    return (
      <div>
        <h1 id="tabelLabel" >Excel DB</h1>
        <p>This component demonstrates fetching data from the server.</p>
        {contents}
      </div>
    );
  }

  async populateWeatherData() {
    const response = await fetch('/api/Excel/Index');  //'./Model/onlineid');
    const data = await response.json();
    console.log(data);
    //const data = [{ mricode: "mricode-test", date: "Today", summary: "fetch?" },{ mricode: "mricode-test2", date: "yesterday", summary: "wrtch?" }]
    this.setState({ DispoList: data, loading: false });
  }
  async getShieldData() {
//      let request = Object.assign({}, requestBase, { method: "GET" });

//      const response = await fetch('/api/Excel/Index', request);//.then(handleResponse);
      const response = await fetch('/api/Excel/Index', {
          method: 'GET',
          credentials: "include",
          mode: 'cors'
      });
      const data = await response.json();
      console.log(data);
      //const data = [{ mricode: "mricode-test", date: "Today", summary: "fetch?" },{ mricode: "mricode-test2", date: "yesterday", summary: "wrtch?" }]
      this.setState({ DispoList: data, loading: false });
  }
}
