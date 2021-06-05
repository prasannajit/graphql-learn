const graphql = require('graphql');
const { GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema, GraphQLList } = graphql;
const _ = require('lodash');
const fetch = require('cross-fetch');
const { json } = require('express');

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                return fetch(`http://localhost:3000/companies/${parentValue.id}/users`)
                    .then((resp) => {
                        if (resp.status >= 400) {
                            throw new Error(`API failed with error code ${resp.status}`)
                        } else {
                            return resp.json()
                        }
                    })
                    .then((data) => {
                        return data;
                    });
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        company: {
            type: CompanyType,
            resolve(parentValue, args) {
                return fetch(`http://localhost:3000/companies/${parentValue.companyId}`)
                    .then((resp) => {
                        if (resp.status >= 400) {
                            throw new Error(`API failed with error code ${resp.status}`)
                        } else {
                            return resp.json()
                        }
                    })
                    .then((data) => {
                        return data;
                    });
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: {
                id: { type: GraphQLString }
            },
            resolve(parentValue, args) {
                return fetch(`http://localhost:3000/users/${args.id}`).then((resp) => {
                    if (resp.status >= 400) {
                        throw new Error(`API failed with error code ${resp.status}`)
                    } else {
                        return resp.json()
                    }
                }).then((data) => {
                    return data;
                })
            }
        },
        company: {
            type: CompanyType,
            args: {
                id: { type: GraphQLString }
            },
            resolve(parentValue, args) {
                return fetch(`http://localhost:3000/companies/${args.id}`)
                    .then((resp) => {
                        if (resp.status >= 400) {
                            throw new Error(`API failed with error code ${resp.status}`)
                        } else {
                            return resp.json()
                        }
                    })
                    .then((data) => {
                        return data;
                    });
            }
        },
    }
})

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLString },
            },
            resolve(parentValue, { firstName, age }) {
                console.log(firstName, age);
                return fetch(`http://localhost:3000/users`, {
                    method: 'POST',
                    body: JSON.stringify({
                        firstName,
                        age,
                    }),
                    headers: {
                        'content-type': 'application/json;charset=UTF-8'
                    }
                }).then(resp => {
                    if (resp.status >= 400) {
                        throw new Error(`API failed with error code ${resp.status}`)
                    } else {
                        return resp.json()
                    }
                }).then(data => data);
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                id: { type: GraphQLString }
            },
            resolve(parentValue, args) {
                fetch(`http://localhost:3000/users/${args.id}`, {
                    method: 'DELETE'
                }).then((resp) => {
                    if (resp.status >= 400) {
                        throw new Error(`API failed with error code ${resp.status}`)
                    } else {
                        return resp.json()
                    }
                }).then(data => data);
            }
        },
        editUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                firstName: { type: GraphQLString },
                age: { type: GraphQLInt },
                companyId: { type: GraphQLString }
            },
            resolve(parentValue, { id, firstName, age, companyId }) {
                fetch(`http://localhost:3000/users/${id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        firstName,
                        age,
                        companyId
                    }),
                    headers: {
                        'content-type': 'application/json;charset=UTF-8'
                    }
                }).then((resp) => {
                    if (resp.status >= 400) {
                        throw new Error(`API failed with error code ${resp.status}`)
                    } else {
                        return resp.json()
                    }
                }).then(data => { console.log(data); return data; });
            }
        }

    }
})
module.exports = new GraphQLSchema({ query: RootQuery, mutation });