class ApiResponse{
    constuctor(statuscode,data,message="Success"){
        this.statuscode=statuscode;
        this.message=message
        this.data=data
        this.success=statuscode < 400
    }
}