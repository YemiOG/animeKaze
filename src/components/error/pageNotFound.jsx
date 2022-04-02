import React from 'react';

function PageNotFound() {
    return(
    <div className="container-page">
        <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Error 404: Not Found</title>
  </head>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      height: 100vh;
      width: 100%;
      background-image: linear-gradient(
          rgba(250, 244, 244, 0.6),
          rgba(250, 244, 244, 0.6)
        ),
        url(/anime-girl.jpg);
      background-size: cover;
    }
    header {
      font-style: normal;
      font-weight: bold;
      font-size: 24px;
      line-height: 25px;
      letter-spacing: -0.08em;
      text-transform: uppercase;
      display: flex;
      justify-content: space-between;
      padding: 40px;

      color: #333333;
    }
    main {
      display: grid;
      grid-template-rows: 2fr, 1fr, 0.5fr;
      grid-template-columns: 1fr, 1fr, 0.5fr;
      row-gap: 80px;
      padding-left: 40px;
      width: 50%;
    }
    h1 {
      width: 656px;
      height: 190px;
      right: 735px;
      top: 165px;

      font-family: "Space Mono", monospace;
      font-style: normal;
      font-weight: bold;
      font-size: 64px;
      line-height: 95px;
      letter-spacing: -0.035em;
      color: #333333;
    }
    p {
      width: 381px;
      height: 108px;
      right: 935px;
      top: 391px;

      font-family: "Space Mono", monospace;
      font-style: normal;
      font-weight: normal;
      font-size: 24px;
      line-height: 36px;
      letter-spacing: -0.035em;

      /* Gray 2 */

      color: #4f4f4f;
    }

    button {
      font-family: "Space Mono", monospace;
      font-style: normal;
      font-weight: bold;
      font-size: 15px;
      line-height: 21px;
      border: none;
      border-radius: 9px;
      width: 30%;

      letter-spacing: -0.035em;
      text-transform: uppercase;
      color: #ffffff;
      background: #333333;
      display: inline-block;
      padding: 16px 32px;
    }
  </style>
  <body>
    <header>
      <div>Error 404: Not Found</div>
      <div>404 が見つかりません</div>
    </header>
    <main>
      <h1 class="error-disclaimer">Oops! I have bad news for you</h1>
      <p class="error-message">
        The page you are looking for might be removed or temporarlily
        unavailable
      </p>
      <button>Back to Homepage</button>
    </main>
  </body>
</html>







    
        





    </div>  
    )
}

export default PageNotFound
