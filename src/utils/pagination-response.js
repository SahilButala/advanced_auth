

class paginationResponse{
    constructor(currentPage = 0 , totalPages = 0 , totalCount = 0 , data = [] || {} ){
         if(currentPage || totalCount || totalPages || data){
            this.currentPage = currentPage,
            this.totalPages = totalPages,
            this.totalCount = totalCount,
            this.data = data
         }
    }

}

module.exports = paginationResponse