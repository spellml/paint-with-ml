import torch
import json

class ServingModel(torch.nn.Module):
    def __init__(self):
        super(ServingModel, self).__init__()

    def forward(self, double, triple, squared):
        return (double*2, triple*3, squared**2)

# Trace and save
module_instance = ServingModel()
test_input = (torch.tensor([1,2]), torch.tensor([3,4]), torch.tensor([5,6]))
traced_module = torch.jit.trace(module_instance, test_input)
traced_module.save("model.pt")