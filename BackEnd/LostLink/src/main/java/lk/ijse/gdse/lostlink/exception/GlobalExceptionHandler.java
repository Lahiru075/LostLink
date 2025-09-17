package lk.ijse.gdse.lostlink.exception;

import lk.ijse.gdse.lostlink.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleResourceNotFoundException(ResourceNotFoundException e) {
        return new ResponseEntity(
                new ApiResponse(404, e.getMessage(),null), HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<ApiResponse> handleResourceAlreadyExistsException(ResourceAlreadyExistsException e) {
        return new ResponseEntity(
                new ApiResponse(409, e.getMessage(), null), HttpStatus.CONFLICT
        );
    }

    @ExceptionHandler(AccountSuspendedException.class)
    public ResponseEntity<ApiResponse> handleAccountSuspendedException(AccountSuspendedException e) {
        return new ResponseEntity(
                new ApiResponse(403, e.getMessage(), null), HttpStatus.FORBIDDEN
        );
    }

    @ExceptionHandler(UnauthorizedOperationException.class)
    public ResponseEntity<ApiResponse> handleUnauthorizedOperationException(UnauthorizedOperationException e) {
        return new ResponseEntity(
                new ApiResponse(403, e.getMessage(), null), HttpStatus.FORBIDDEN
        );
    }

    @ExceptionHandler(InvalidRequestStateException.class)
    public ResponseEntity<ApiResponse> handleInvalidRequestStateException(InvalidRequestStateException e) {
        return new ResponseEntity(
                new ApiResponse(400, e.getMessage(), null), HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(PreconditionFailedException.class)
    public ResponseEntity<ApiResponse> handlePreconditionFailedException(PreconditionFailedException e) {
        return new ResponseEntity(
                new ApiResponse(412, e.getMessage(), null), HttpStatus.PRECONDITION_FAILED
        );
    }
}
