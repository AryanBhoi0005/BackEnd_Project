class ApiError extends Error{
    // This line declares a new class ApiError that extends the built-in Error class. By extending Error, ApiError inherits the properties and methods of the Error class, allowing it to be used as a standard error object.
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