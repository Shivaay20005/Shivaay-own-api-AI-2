




def add_two_numbers(num1, num2):
    """Function to add two numbers."""
    return num1 + num2

# Taking input from the user
try:
    number1 = float(input("Enter the first number: "))
    number2 = float(input("Enter the second number: "))
    
    result = add_two_numbers(number1, number2)
    print(f"The sum of {number1} and {number2} is: {result}")
except ValueError:
    print("Invalid input! Please enter numeric values.")