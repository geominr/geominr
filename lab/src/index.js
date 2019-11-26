import { h, render } from 'preact'
import App from './App'
import createStore from 'unistore'
import { Provider } from 'unistore/preact'

let store = createStore({
  count: 0,
  columns: [],
  scale: 'state',
  data: { head: [], body: [], entires: {}, keys: new Set() }
})

//polyfill
import 'whatwg-fetch'
import Promise from 'promise-polyfill'

if (!window.Promise) {
  window.Promise = Promise
}

//render
render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
)
