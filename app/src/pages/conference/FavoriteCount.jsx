import * as React from 'react';
import { gql, useQuery, useSubscription } from '@apollo/client';
import './style-sessions.css';
import { Link, useParams } from 'react-router-dom';

const FAVORITES = gql`
  subscription favorites{
    favorites{
      sessionId
      count
    }
  }
`;

export function FavoriteCount(){
  const {loading, error, data} = useSubscription(FAVORITES);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  return <h4>New favorite: {!loading && data.favorites.sessionId}</h4>;
}