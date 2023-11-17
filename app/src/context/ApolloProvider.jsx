import React from "react";
import {
  ApolloProvider as Provider,
  ApolloClient,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import {WebSocketLink} from '@apollo/client/link/ws';
import { AuthContext } from "./AuthProvider";
import { getMainDefinition } from '@apollo/client/utilities';

const wsLink = new WebSocketLink({
  uri: "ws://localhost:4000/graphql",
  options: {
    reconnect: true
  }
})
const httpLink = new HttpLink({
  uri: "/graphql",
})
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);
export function ApolloProvider({ children }) {
  const { isAuthenticated } = React.useContext(AuthContext);
  React.useEffect(() => {
    const client = new ApolloClient({
      cache: new InMemoryCache({
        typePolicies: {
          User: {
            fields: {
              favorites: {
                merge(_ignored, incoming) {
                  return incoming;
                },
              },
            },
          },
        },
      }),
      link: splitLink,
      credentials: "same-origin",
    });
    setClient(client);
  }, [isAuthenticated]);

  const [client, setClient] = React.useState(undefined);

  return client ? <Provider client={client}>{children}</Provider> : null;
}
