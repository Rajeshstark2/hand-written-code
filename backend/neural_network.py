import numpy as np

class NeuralNetwork:
    def __init__(self, sizes):
        """
        Initialize a neural network with given layer sizes.
        sizes: list of integers representing the number of neurons in each layer
        """
        self.num_layers = len(sizes)
        self.sizes = sizes
        # Initialize biases for all layers except input layer
        self.biases = [np.random.randn(y, 1) for y in sizes[1:]]
        # Initialize weights between layers
        self.weights = [np.random.randn(y, x) for x, y in zip(sizes[:-1], sizes[1:])]
    
    def feedforward(self, a):
        """
        Forward propagation through the network
        a: input to the network
        """
        for b, w in zip(self.biases, self.weights):
            a = self.sigmoid(np.dot(w, a) + b)
        return a
    
    def sigmoid(self, z):
        """
        Sigmoid activation function
        """
        return 1.0 / (1.0 + np.exp(-z))
    
    def train(self, training_data, epochs, mini_batch_size, test_data=None):
        """
        Train the neural network using mini-batch stochastic gradient descent
        training_data: list of tuples (x, y) representing training inputs and desired outputs
        epochs: number of training epochs
        mini_batch_size: size of mini batches
        test_data: optional test data to evaluate performance during training
        """
        if test_data:
            n_test = len(test_data)
        n = len(training_data)
        
        for j in range(epochs):
            # Shuffle training data and create mini-batches
            np.random.shuffle(training_data)
            mini_batches = [
                training_data[k:k + mini_batch_size]
                for k in range(0, n, mini_batch_size)
            ]
            
            # Train on each mini-batch
            for mini_batch in mini_batches:
                self.update_mini_batch(mini_batch)
            
            # Print progress if test data is provided
            if test_data:
                print(f"Epoch {j}: {self.evaluate(test_data)} / {n_test}")
            else:
                print(f"Epoch {j} complete")
    
    def update_mini_batch(self, mini_batch):
        """
        Update network weights and biases using gradient descent on a mini batch
        """
        nabla_b = [np.zeros(b.shape) for b in self.biases]
        nabla_w = [np.zeros(w.shape) for w in self.weights]
        
        for x, y in mini_batch:
            delta_nabla_b, delta_nabla_w = self.backprop(x, y)
            nabla_b = [nb + dnb for nb, dnb in zip(nabla_b, delta_nabla_b)]
            nabla_w = [nw + dnw for nw, dnw in zip(nabla_w, delta_nabla_w)]
        
        learning_rate = 3.0
        m = len(mini_batch)
        self.weights = [w - (learning_rate/m) * nw 
                       for w, nw in zip(self.weights, nabla_w)]
        self.biases = [b - (learning_rate/m) * nb 
                      for b, nb in zip(self.biases, nabla_b)]
    
    def backprop(self, x, y):
        """
        Backpropagation algorithm to compute gradients
        """
        nabla_b = [np.zeros(b.shape) for b in self.biases]
        nabla_w = [np.zeros(w.shape) for w in self.weights]
        
        # Forward pass
        activation = x
        activations = [x]
        zs = []
        
        for b, w in zip(self.biases, self.weights):
            z = np.dot(w, activation) + b
            zs.append(z)
            activation = self.sigmoid(z)
            activations.append(activation)
        
        # Backward pass
        delta = self.cost_derivative(activations[-1], y) * \
                self.sigmoid_prime(zs[-1])
        nabla_b[-1] = delta
        nabla_w[-1] = np.dot(delta, activations[-2].transpose())
        
        for l in range(2, self.num_layers):
            z = zs[-l]
            sp = self.sigmoid_prime(z)
            delta = np.dot(self.weights[-l+1].transpose(), delta) * sp
            nabla_b[-l] = delta
            nabla_w[-l] = np.dot(delta, activations[-l-1].transpose())
        
        return nabla_b, nabla_w
    
    def evaluate(self, test_data):
        """
        Evaluate network performance on test data
        """
        test_results = [(np.argmax(self.feedforward(x)), y)
                       for (x, y) in test_data]
        return sum(int(x == y) for (x, y) in test_results)
    
    def cost_derivative(self, output_activations, y):
        """
        Derivative of the cost function
        """
        return (output_activations - y)
    
    def sigmoid_prime(self, z):
        """
        Derivative of the sigmoid function
        """
        return self.sigmoid(z) * (1 - self.sigmoid(z)) 