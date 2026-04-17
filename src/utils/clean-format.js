
const errorjoiFromat = (error)=>{
     return error.details.map(el => el.message).join(', ');
}

module.exports = {
      errorjoiFromat
}

