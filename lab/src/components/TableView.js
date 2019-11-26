import { h } from 'preact'
import Table from 'react-bootstrap/Table'
import { connect } from 'unistore/preact'

const TableView = ({ data }) => {
  const { body, head } = data

  return (
    <Table bordered hover>
      <thead>
        <tr>
          {head.length > 1
            ? head.map((v, i) => <th key={`table-head-${i}`}>{v}</th>)
            : null}
        </tr>
      </thead>
      <tbody>
        {body.map((r, i) => (
          <tr key={`table-row-${i}`}>
            {r.map((v, i2) => (
              <th key={`table-cell-${i}-${i2}`}>{v}</th>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default connect('data')(({ data }) => <TableView data={data} />)
