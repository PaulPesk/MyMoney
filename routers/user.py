from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from api.dependencies import get_current_user
from database.connection import get_db
from models.user import User
from schemas.user import UserCreate, UserResponse
from core.security import hash_password  # Ή από όπου κάνεις import το hashing function σου (π.χ. utils.hash)

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Registers a new user in the system."""
    
    # 1. Έλεγχος αν υπάρχει ήδη χρήστης με αυτό το email
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    # 2. Hashing του κωδικού πρόσβασης
    hashed_password = hash_password(user_in.password) # Προσαρμοσε τη συνάρτηση αν διαφέρει το name/import

    # 3. Δημιουργία του αντικειμένου User
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_password
        # Πρόσθεσε επιπλέον πεδία αν υπάρχουν στο User model σου (π.χ. full_name=user_in.full_name)
    )

    # 4. Αποθήκευση στη βάση δεδομένων
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 5. Επιστροφή του νέου χρήστη (απαραίτητο για το response_model)
    return new_user


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    """Retrieves the details of the currently authenticated user."""
    return current_user