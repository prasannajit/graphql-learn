const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema } = graphql;
const _ = require('lodash');
const fetch = require('cross-fetch');

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: {
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
    }
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
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
    }
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

module.exports = new GraphQLSchema({ query: RootQuery });