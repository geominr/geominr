import regeneratorRuntime from 'regenerator-runtime'

function censusPromise(args) {
  return new Promise(function(resolve, reject) {
    census(args, function(err, json) {
      if (!err) {
        resolve(json)
      } else {
        reject(err)
      }
    })
  })
}

const queryLookup = {
  state: {
    geoHierarchy: {
      state: '*'
    }
  },
  county: {
    geoHierarchy: {
      county: '*'
    }
  }
}

async function updateData(columns, scale) {
  //group for each vintage and year, and build query
  const groups = columns.reduce((groups, column) => {
    let group = groups.find(
      group =>
        group.vintage === column.vintage && group.sourcePath[1] === column.type
    )
    if (group) {
      group.values.push(column.variable.id)
      group.labels.push(column.variable.label)
    } else {
      group = {
        vintage: column.vintage,
        sourcePath: ['acs', column.type],
        values: [column.variable.id],
        labels: [column.variable.label]
      }
      groups.push(group)
    }
    return groups
  }, [])

  const data = await Promise.all(
    groups.map(async group => {
      const query = { ...group, ...queryLookup[scale] }
      return { res: await censusPromise(query), ...group }
    })
  )

  //manual set ids
  function getIds(item, scale) {
    switch (scale) {
      case 'state':
        return item.state
      case 'county':
        return `${item.state}${item.county}`
      default:
        return item.name
    }
  }

  //generate entries for all columns
  const entries = data.reduce((entries, group) => {
    group.values.forEach((value, index) => {
      const head = `${group.labels[index]} (${group.vintage}/${group.sourcePath[1]})`
      entries[head] = {}
      group.res.forEach(
        item => (entries[head][getIds(item, scale)] = item[value])
      )
    })
    return entries
  }, {})

  //get keys using merge
  const keys = data.reduce((keys, group) => {
    return new Set([...keys, ...group.res.map(item => getIds(item, scale))])
  }, [])

  //generate head
  const head = [scale, ...Object.keys(entries)]

  //transpose to create body
  const body = Array.from(keys)
    .map(key => {
      //find value for key in entries
      const values = Object.values(entries).map(entry =>
        key in entry ? entry[key] : ''
      )
      return [key, ...values]
    })
    .sort((a, b) => a[0].localeCompare(b[0]))

  return { body, head, keys, entries }
}

const actions = store => ({
  addColumns: async ({ columns, scale }, newColumn) => {
    //only add new column, if it isn't a duplicate
    if (
      columns.some(item => JSON.stringify(item) === JSON.stringify(newColumn))
    ) {
      return
    }
    const newColumns = [...columns, newColumn]

    return { columns: newColumns, data: await updateData(newColumns, scale) }
  },
  setScale: async ({ columns, scale }, selectedScale) => {
    return {
      scale: selectedScale,
      data: await updateData(columns, selectedScale)
    }
  }
})

export default actions
