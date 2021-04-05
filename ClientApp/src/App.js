import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { FetchDispo } from './components/FetchDispo';
import { ExcelTest } from './components/ExcelTest';
import { Counter } from './components/Counter';

import './custom.css'

export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
      <Layout>
        <Route exact path='/' component={ExcelTest} />
        <Route path='/counter' component={Counter} />
        <Route path='/fetch-dispo' component={FetchDispo} />
        <Route path='/load-dispo' component={ExcelTest} />
      </Layout>
    );
  }
}
