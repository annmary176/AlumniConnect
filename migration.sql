-- Migration: Update Mentorship_Sessions schema and create Session_Bookings table
USE alumniconnect;

-- Step 1: Add Max_Students column to Mentorship_Sessions if it doesn't exist
ALTER TABLE Mentorship_Sessions ADD COLUMN Max_Students INT DEFAULT 5;

-- Step 2: Create Session_Bookings table for tracking multiple student bookings
CREATE TABLE IF NOT EXISTS Session_Bookings (
    Booking_ID INT PRIMARY KEY AUTO_INCREMENT,
    Session_ID INT NOT NULL,
    Student_ID INT NOT NULL,
    Booked_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Session_ID) REFERENCES Mentorship_Sessions(Session_ID) ON DELETE CASCADE,
    FOREIGN KEY (Student_ID) REFERENCES Users(User_ID) ON DELETE CASCADE,
    UNIQUE(Session_ID, Student_ID)
);

-- Step 3: Create trigger to enforce max students limit
DELIMITER $$

CREATE TRIGGER enforce_max_students BEFORE INSERT ON Session_Bookings
FOR EACH ROW
BEGIN
    DECLARE slot_count INT;
    DECLARE max_slots INT;
    
    SELECT COUNT(*) INTO slot_count FROM Session_Bookings WHERE Session_ID = NEW.Session_ID;
    SELECT Max_Students INTO max_slots FROM Mentorship_Sessions WHERE Session_ID = NEW.Session_ID;
    
    IF slot_count >= max_slots THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Session booking limit reached';
    END IF;
END$$

DELIMITER ;
