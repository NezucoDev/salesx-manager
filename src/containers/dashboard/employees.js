import React from 'react'
import { Route, Link } from 'react-router-dom'

import http from '../../services/httpService'

import XSelect from '../../components/common/xui/xselect'
import XInput from '../../components/common/xui/xinput'
import Loading from '../../components/common/loading'
import NewEmployeeForm from '../../components/forms/newEmployeeForm'

const apiEndpoint = '/employees'

class Employees extends React.Component {
    render() {
        return (
            <React.Fragment>
                <Route path='/dashboard/employees' exact component={AllEmployees} />
                <Route path='/dashboard/employees/new-employee' component={NewEmployee} />
            </React.Fragment>
        )
    }

    static renderNoBrandMsg() {
        return (
            <section className='card depth-2'>
                <h2>Looks like you don't have any brands yet.</h2>
                <p>Create at least one brand first, then a branch. After that, you can add new employees.</p>
            </section>
        )
    }

    static renderNoBranchMsg() {
        return (
            <section className='card depth-2'>
                <h2>Looks like you don't have any branches yet.</h2>
                <p>Create at least one branch first, then you can start adding new employees.</p>
            </section>
        )
    }
}

class AllEmployees extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            brands: null,
            selectedBrand: '',
            branches: null,
            selectedBranch: '',
            employees: null,
            employeesFilter: ''
        }
    }

    async populateBrands() {
        try {
            const { data: brands } = await http.get('/brands')
            this.setState({ brands, selectedBrand: brands[0]?._id || '' })
        } catch ({ response }) {
            console.error(response.data)
        }
    }

    async populateBranches() {
        this.setState({ branches: null })

        try {
            const { data: branches } = await http.get(`/branches?brand=${this.state.selectedBrand}`)

            branches.unshift({ _id: '0', name: 'All' })
            this.setState({ branches, selectedBranch: branches[0]._id })
        } catch ({ response }) {
            console.error(response.data)
        }
    }

    async populateEmployees() {
        this.setState({ employees: null })

        try {
            let employees = []
            if (this.state.selectedBranch && this.state.selectedBranch !== '0')
                employees = (await http.get(`${apiEndpoint}?brand=${this.state.selectedBrand}&branch=${this.state.selectedBranch}`)).data
            else
                employees = (await http.get(`${apiEndpoint}?brand=${this.state.selectedBrand}`)).data
            this.setState({ employees })
        } catch ({ response }) {
            console.log(response.data)
        }
    }

    async componentDidMount() {
        document.title = `Employees | ${process.env.REACT_APP_NAME}`

        await this.populateBrands()
        await this.populateBranches()
        this.populateEmployees()
    }

    brandSelectHandler = (e) => {
        const selectedBrand = (this.state.brands.find(brand => brand._id === e.target.value))._id
        this.setState({ selectedBrand }, async () => {
            await this.populateBranches()
            this.populateEmployees()
        })
    }

    branchSelectHandler = (e) => {
        const selectedBranch = (this.state.branches.find(branch => branch._id === e.target.value))._id
        this.setState({ selectedBranch }, this.populateEmployees)
    }

    renderEmployeesList() {
        if (this.state.employees === null) return <Loading />
        else if (this.state.employees.length === 0)
            return (
                <section className='card depth-2'>
                    <em>Current selection does not have any employees yet.</em>
                </section>
            )

        const employeesList = this.state.employees
            .filter(employee =>
                (`${employee.firstName} ${employee.lastName}`).toLowerCase().includes(this.state.employeesFilter.toLowerCase())
                || employee.email?.toLowerCase().includes(this.state.employeesFilter.toLowerCase())
            )
            .map(employee => {
                return (
                    <tr key={employee._id}>
                        <td>{employee.firstName} {employee.lastName}</td><td>{employee.email || 'N/A'}</td><td>{employee.phoneNumber || 'N/A'}</td><td>{employee.title || 'N/A'}</td><td>{employee.salary || 'N/A'}</td>
                    </tr>
                )
            })

        return (
            <section className='card depth-2'>
                <XInput
                    name='filter'
                    placeholder='Filter Employees'
                    value={this.state.employeesFilter}
                    onChange={(e) => this.setState({ employeesFilter: e.target.value })} />

                {employeesList.length === 0 ?
                    <p>Your search did not yeild any results.</p> :
                    <table style={{ width: '100%' }}>
                        <thead style={{ textAlign: 'left' }}>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone Number</th>
                                <th>Title</th>
                                <th>Salary</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employeesList}
                        </tbody>
                    </table>}
            </section>
        )
    }

    render() {
        if (this.state.brands === null || this.state.branches === null) return <Loading />

        if (this.state.brands.length === 0) return Employees.renderNoBrandMsg()
        else if (this.state.branches.length <= 1) return Employees.renderNoBranchMsg()

        const brandsList = this.state.brands.map(brand => {
            return (
                <option key={brand._id} value={brand._id}>{brand.name}</option>
            )
        })

        const branchesList = this.state.branches.map(branch => {
            return (
                <option key={branch._id} value={branch._id}>{branch.name}</option>
            )
        })

        return (
            <React.Fragment>
                <section className='card depth-2'>
                    <h2>Manage Employees</h2>
                    <Link to='/dashboard/employees/new-employee'>Add New Employee</Link>

                    <div className='d-flex mt-15'>
                        <div className='flex-child'>
                            <XSelect label='Select a Brand' name='brand' value={this.state.selectedBrand} options={brandsList} onChange={this.brandSelectHandler} />
                        </div>
                        <div className='flex-child'>
                            <XSelect label='Select a Branch' name='branch' options={branchesList} onChange={this.branchSelectHandler} />
                        </div>
                    </div>
                </section>

                {this.renderEmployeesList()}
            </React.Fragment>
        )
    }
}

class NewEmployee extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            brands: null,
            branches: null
        }
    }

    async componentDidMount() {
        document.title = `New Employee | ${process.env.REACT_APP_NAME}`

        const { data: brands } = await http.get('/brands')
        const { data: branches } = await http.get('/branches')
        this.setState({ brands, branches })
    }

    render() {
        if (this.state.brands === null || this.state.branches === null) return <Loading />

        if (this.state.brands.length === 0) return Employees.renderNoBrandMsg()
        else if (this.state.branches.length === 0) return Employees.renderNoBranchMsg()

        return (
            <section className='card depth-2'>
                <h2>Add a New Employee</h2>
                <div>
                    <NewEmployeeForm brands={this.state.brands} branches={this.state.branches} />
                </div>
            </section>
        )
    }
}

export default Employees