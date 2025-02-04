var src_default = {
  async fetch(request, env) {
    //21.0090935,105.7907249
    //21.0301415,105.7494736

    const { searchParams } = new URL(request.url);
    let showMode = searchParams.get("show") || "";
    let lat = searchParams.get("lat") || 105.7494736;
    let lng = searchParams.get("lng") || 21.0301415;

    let coords = searchParams.get("coords") || "";
    if (coords != "") {
      let arr = coords.split(",");
      lat = arr[0];
      lng = arr[1];
    }

    const stmt = env.DB.prepare(
      "SELECT * FROM idmaps WHERE " +
        lng +
        " >= west AND " +
        lng +
        " <= east AND " +
        lat +
        " >= north AND " +
        lat +
        " <= south;",
    );
    const { results } = await stmt.all();
    var size = Object.keys(results).length;
    var returnObj = null;
    if (showMode == "full") {
      return new Response(JSON.stringify(results, null, 2), {
        headers: {
          "content-type": "application/json",
        },
      });
    }
    if (size <= 0) {
      returnObj = {};
    } else if (size == 1) {
      returnObj = results[0];
    } else {
      var counter = 0;
      var findId = 0;
      for (var i = 0; i < size; i++) {
        var d = results[i];
        if (d.parent != "") {
          counter++;
          findId = i;
        }
      }
      if (counter == 1) {
        returnObj = results[findId];
      } else {
        //if have more than 1 same level results
        //loop to check in polygon
        for (var i = 0; i < size; i++) {
          var d = results[i];
          if (d.parent != "") {
            //todo:get polygon coords of d.id
            // check lat,long in polygon of d
            findId = i;
            //if is in polygon then break loop
            break;
          }
        }
        returnObj = results[findId];
      }
    }

    return new Response(JSON.stringify(returnObj, null, 2), {
      headers: {
        "content-type": "application/json",
      },
    });
  },
};
export { src_default as default };
