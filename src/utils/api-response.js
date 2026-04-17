


class ApiRes{
     constructor(status = 404 , success = false , message = "" , data = [] || {}){
           this.status = status
           this.success = success
           this.message = message
           if(data){
              this.data = data
           }
     } 
}


module.exports = ApiRes