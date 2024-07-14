class ApiError extends Error{
    constructor(
        statuscode,
        message="Something went wrong",
        errors=[],
        stack=""
    ){
        super(message)
        this.statuscode=statuscode
        this.data=null
        this.message=message
        this.success=false;
        this.errors=errors

        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
        //Used to find error in stack of code


    }
}
export {ApiError}