import { h } from 'preact'
import Nav from 'react-bootstrap/Nav'
import { connect } from 'unistore/preact'
import actions from '../actions'

const ScaleSelect = ({ scale, setScale }) => {
  return (
    <Nav
      variant="pills"
      activeKey={scale}
      onSelect={selectedScale => setScale(selectedScale)}
    >
      <Nav.Item>
        <Nav.Link eventKey="state">States</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="county">Counties</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="tract" disabled>
          Tracts
        </Nav.Link>
      </Nav.Item>
    </Nav>
  )
}

export default connect(
  'scale',
  actions
)(({ scale, setScale }) => <ScaleSelect scale={scale} setScale={setScale} />)
