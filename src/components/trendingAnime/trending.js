import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router';
import { Link, useLocation } from 'react-router-dom'

import Card from "./animeCard"
import animes from "./animes"


function Trend(){

	return(
		<div className="anime-trends">
			<div className="trending-anime">
				<div className="caption">
					Trending Animations
				</div>
				<div className="trend-scroll">
					<div className="trend">
						{animes.map( anime => <Card key={anime.id} image={anime.img} name={anime.title} content={anime.content}/> )}
					</div>
				</div>
			</div>
		</div>
	)
}


export default Trend
