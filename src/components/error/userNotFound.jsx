import React, {useEffect, useRef} from "react";

function UserNotFound(props) {

  function removeDiv(){
    props.notFound && props.notFound(false)
  }

  const notFoundDiv = useRef(null);

  useEffect(()=>{
    notFoundDiv.current.focus();
  }, []);

    return(
    <div className="container-page" tabIndex={1} onBlur= {removeDiv} ref={notFoundDiv}>
      <div className="">
          <div className="">
             <p>Sorry! User not found</p>
          </div>
      </div>
    </div>  
    )
}

export default UserNotFound
