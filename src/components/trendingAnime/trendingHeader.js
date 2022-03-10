import { useState } from 'react';
import Modal from 'react-bootstrap/Modal'

// local imports
import Card from "./animeCard"
import animes from "./animes"
import { ReactComponent as Close } from '../../images/svg/closeButton.svg'


function HeaderTrend(){

	const [showModal, setShowModal] = useState(false);
	const [animeSelected, setAnimeSelected] = useState(false);

	const displaySelected = item => {
		setAnimeSelected(item)
		setShowModal(true)
	}

	return(
		<>
			<div className="anime-header-trends">
				<div className="">
					<div className="caption">
						Trending Animations
					</div>
					<div className="trend-scroll">
						<div className="trend" >
							{animes.map( anime => <Card key={anime.id} image={anime.img} name={anime.title} 
										  content={anime.content} show={displaySelected} anime={anime}/> )}
						</div>
					</div>
				</div>
			</div>
			<Modal 
				show={showModal} 
				onHide={() => setShowModal(false)} >

				<Modal.Header>
					<Modal.Title>
					 <img src={animeSelected.img} alt=""/>
					 <div className="close-modal-button">
					 	<Close onClick = {() => setShowModal(false)}/>
					 </div>
					</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<p>{animeSelected.title}</p>
					<p>{animeSelected.content}</p>
				</Modal.Body>

				<Modal.Footer>
				</Modal.Footer>
			</Modal>
		</>
	)
}


export default HeaderTrend
