import { h, Fragment } from 'preact'
import { connect } from 'unistore/preact'
import actions from './actions'
import { Container, Row, Col } from 'react-bootstrap'

import MapView from './components/MapView'
import ColumnFinder from './components/ColumnFinder'
import TableView from './components/TableView'
import ScaleSelect from './components/ScaleSelect'

import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'

const App = () => {
  return (
    <Fragment>
      <Container>
        <Row>
          <h4>
            <img src="./assets/images/geominer_logo.png" id="logo" /> Lab
          </h4>
        </Row>
        <Row>
          <Col md={5}>
            <Row>
              <ColumnFinder />
            </Row>
            <Row
              style={{ overflow: 'auto', marginTop: '1em', maxHeight: '15em' }}
            >
              <TableView />
            </Row>
          </Col>
          <Col md={7}>
            <Row>
              <ScaleSelect />
            </Row>
            <Row style={{ height: '100%' }}>
              <MapView />
            </Row>
          </Col>
        </Row>
      </Container>
    </Fragment>
  )
}

export default App
