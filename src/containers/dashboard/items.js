import React from 'react'
import { Route, Link } from 'react-router-dom'

import http from '../../services/httpService'

import XSelect from '../../components/common/xui/xselect'
import XInput from '../../components/common/xui/xinput'
import NewItemForm from '../../components/forms/newItemForm'

const apiEndpoint = '/items'

const Items = (props) => {
    return (
        <React.Fragment>
            <Route path='/dashboard/items' exact component={AllItems} />
            <Route path='/dashboard/items/new-item' component={NewItem} />
        </React.Fragment>
    )
}

class AllItems extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            items: [],
            itemsFilter: '',
            brands: [],
            selectedBrandId: ''
        }
    }

    // TODO: decide whether to fetch all items of all users' brands, or just one brand's at a time
    async populateItems() {
        try {
            let items = []
            if (this.state.selectedBrandId === '0')
                items = (await http.get(apiEndpoint)).data
            else
                items = (await http.get(apiEndpoint + `?brand=${this.state.selectedBrandId}`)).data

            const filtered = items // items.filter(item => item.brandId === this.state.selectedBrand._id)
            this.setState({ items: filtered })
        } catch (err) {
            console.log(err)
        }
    }

    async populateBrands() {
        try {
            const { data: brands } = await http.get('/brands')

            if (brands.length > 0) {
                brands.unshift({ _id: '0', name: 'All' })
                this.setState({ brands })
            }
        } catch ({ response }) {
            console.log(response.data)
        }
    }

    async componentDidMount() {
        await this.populateBrands()

        // set selected brand
        let selectedBrandIndex = 0
        if (this.props.location.search.indexOf('brand') !== -1) {
            const brand = this.state.brands.findIndex(b => b._id === this.props.location.search.split('=')[1])
            if (brand >= 0)
                selectedBrandIndex = brand
        }
        this.setState({ selectedBrandId: this.state.brands[selectedBrandIndex]._id })

        this.populateItems()
    }

    brandSelectHandler = (e) => {
        const selectedBrand = this.state.brands.find(brand => brand._id === e.target.value)
        this.setState({ selectedBrandId: selectedBrand._id }, this.populateItems)
    }

    renderNoBrandsMsg() {
        return (
            <section className='card depth-2'>
                <h2>Oops! Looks like you don't have any brands yet.</h2>
                <p>Create at least one brand first, so you can add the items/products associated with that particular brand.</p>
            </section>
        )
    }

    renderItemsList() {
        const itemsList = this.state.items
            .filter(item => 
                item.name.toLowerCase().includes(this.state.itemsFilter.toLowerCase()) || item.barcode.includes(this.state.itemsFilter)
            ).map(item => {
                return (
                    <tr key={item._id}>
                        <td>{item.name}</td><td>{item.barcode || 'N/A'}</td><td>{item.price}</td><td>{item.description || 'N/A'}</td>
                    </tr>
                )
            })

        const brandsList = this.state.brands.map(brand => {
            return (
                <option key={brand._id} value={brand._id}>{brand.name}</option>
            )
        })

        return (
            <React.Fragment>
                <section className='card depth-2'>
                    <h2>Manage Items</h2>
                    <Link to='/dashboard/items/new-item'>Add New Item</Link>
                </section>

                <section className='card depth-2'>
                    <XSelect label='Select a Brand' name='brand' value={this.state.selectedBrandId} options={brandsList} onChange={this.brandSelectHandler} />

                    <XInput
                        name='filter'
                        placeholder='Filter Items'
                        value={this.state.itemsFilter}
                        onChange={(e) => this.setState({ itemsFilter: e.target.value })} />

                    <table style={{ width: '100%' }}>
                        <thead style={{ textAlign: 'left' }}>
                            <tr>
                                <th>Name</th>
                                <th>Barcode</th>
                                <th>Price</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemsList}
                        </tbody>
                    </table>
                </section>
            </React.Fragment>
        )
    }

    render() {
        if (this.state.brands.length > 0) {
            return this.renderItemsList()
        }

        return this.renderNoBrandsMsg()
    }
}

class NewItem extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            brands: []
        }
    }

    async componentDidMount() {
        const { data: brands } = await http.get('/brands')
        this.setState({ brands })
    }

    render() {
        if (this.state.brands.length > 0) {
            return (
                <section className='card depth-2'>
                    <h2>Add New Items</h2>
                    <div>
                        <NewItemForm brands={this.state.brands} />
                    </div>
                </section>
            )
        }

        return (
            <section className='card depth-2'>
                <h2>Oops! Looks like you don't have any brands yet.</h2>
                <p>Create at least one brand first, so you can add the items/products associated with that particular brand.</p>
            </section>
        )
    }
}

export default Items