import { h } from 'preact'
import { useState } from 'preact/hooks'
import { Col, Form, Button } from 'react-bootstrap'
import { Typeahead } from 'react-bootstrap-typeahead'
import 'react-bootstrap-typeahead/css/Typeahead.css'

import { connect } from 'unistore/preact'
import actions from '../actions'

//todo - build an api to query for variables
const variableOptions = [
  { id: 'B01001_001E', label: 'Total Population' },
  { id: 'B01001_002E', label: 'Total Male' },
  { id: 'B01001_003E', label: 'Male: Under 5 years' },
  { id: 'B01001_004E', label: 'Male: 5 to 9 years' },
  { id: 'B01001_005E', label: 'Male: 10 to 14 years' },
  { id: 'B01001_006E', label: 'Male: 15 to 17 years' },
  { id: 'B01001_007E', label: 'Male: 18 and 19 years' },
  { id: 'B01001_008E', label: 'Male: 20 years' },
  { id: 'B01001_009E', label: 'Male: 21 years' },
  { id: 'B01001_010E', label: 'Male: 22 to 24 years' },
  { id: 'B01001_011E', label: 'Male: 25 to 29 years' },
  { id: 'B01001_012E', label: 'Male: 30 to 34 years' },
  { id: 'B01001_013E', label: 'Male: 35 to 39 years' },
  { id: 'B01001_014E', label: 'Male: 40 to 44 years' },
  { id: 'B01001_015E', label: 'Male: 45 to 49 years' },
  { id: 'B01001_016E', label: 'Male: 50 to 54 years' },
  { id: 'B01001_017E', label: 'Male: 55 to 59 years' },
  { id: 'B01001_018E', label: 'Male: 60 and 61 years' },
  { id: 'B01001_019E', label: 'Male: 62 to 64 years' },
  { id: 'B01001_020E', label: 'Male: 65 and 66 years' },
  { id: 'B01001_021E', label: 'Male: 67 to 69 years' },
  { id: 'B01001_022E', label: 'Male: 70 to 74 years' },
  { id: 'B01001_023E', label: 'Male: 75 to 79 years' },
  { id: 'B01001_024E', label: 'Male: 80 to 84 years' },
  { id: 'B01001_025E', label: 'Male: 85 years and over' },
  { id: 'B01001_026E', label: 'Total Female' },
  { id: 'B01001_027E', label: 'Female: Under 5 years' },
  { id: 'B01001_028E', label: 'Female: 5 to 9 years' },
  { id: 'B01001_029E', label: 'Female: 10 to 14 years' },
  { id: 'B01001_030E', label: 'Female: 15 to 17 years' },
  { id: 'B01001_031E', label: 'Female: 18 and 19 years' },
  { id: 'B01001_032E', label: 'Female: 20 years' },
  { id: 'B01001_033E', label: 'Female: 21 years' },
  { id: 'B01001_034E', label: 'Female: 22 to 24 years' },
  { id: 'B01001_035E', label: 'Female: 25 to 29 years' },
  { id: 'B01001_036E', label: 'Female: 30 to 34 years' },
  { id: 'B01001_037E', label: 'Female: 35 to 39 years' },
  { id: 'B01001_038E', label: 'Female: 40 to 44 years' },
  { id: 'B01001_039E', label: 'Female: 45 to 49 years' },
  { id: 'B01001_040E', label: 'Female: 50 to 54 years' },
  { id: 'B01001_041E', label: 'Female: 55 to 59 years' },
  { id: 'B01001_042E', label: 'Female: 60 and 61 years' },
  { id: 'B01001_043E', label: 'Female: 62 to 64 years' },
  { id: 'B01001_044E', label: 'Female: 65 and 66 years' },
  { id: 'B01001_045E', label: 'Female: 67 to 69 years' },
  { id: 'B01001_046E', label: 'Female: 70 to 74 years' },
  { id: 'B01001_047E', label: 'Female: 75 to 79 years' },
  { id: 'B01001_048E', label: 'Female: 80 to 84 years' },
  { id: 'B01001_049E', label: 'Female: 85 years and over' }
]

const datasetOptions = [
  { id: 'acs1:2018', label: '2018 ACS 1-year' },
  { id: 'acs5:2017', label: '2017 ACS 5-year' },
  { id: 'acs5:2016', label: '2016 ACS 5-year' },
  { id: 'acs5:2015', label: '2015 ACS 5-year' }
]

const ColumnFinder = ({ columns, addColumns }) => {
  const [dataset, setDataset] = useState(datasetOptions[0].id)
  const [variable, setVariable] = useState()

  const handleSubmit = event => {
    event.preventDefault()
    event.stopPropagation()
    //add to table columns
    if (dataset && variable) {
      const [type, vintage] = dataset.split(':')
      addColumns({ type, vintage, variable })
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Row>
        <Form.Group as={Col} md={11} controlId="formSelectDataset">
          <Form.Label>Dataset</Form.Label>
          <Form.Control
            as="select"
            onChange={e => setDataset(e.target.value)}
            value={dataset}
            required
          >
            {datasetOptions.map(item => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} md={11} controlId="formSelectVariable">
          <Form.Label>Variable</Form.Label>
          <Typeahead
            options={variableOptions}
            placeholder="Choose a variable..."
            id="formSelectVariable"
            value={variable}
            onChange={e => e.length > 0 && setVariable(e[0])}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form.Row>
    </Form>
  )
}

export default connect(
  'columns',
  actions
)(({ columns, addColumns }) => (
  <ColumnFinder columns={columns} addColumns={addColumns} />
))
