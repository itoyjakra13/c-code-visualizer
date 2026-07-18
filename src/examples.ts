/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CProgram, ExecutionStep, Variable, StackFrame, HeapBlock } from "./types";

export const EXAMPLES: CProgram[] = [
  {
    id: "hello_world",
    name: "Hello World",
    category: "basic",
    code: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`
  },
  {
    id: "pointers",
    name: "Pointers & Addresses",
    category: "basic",
    code: `#include <stdio.h>

int main() {
    int val = 100;
    int* ptr = &val;
    
    printf("val: %d\\n", val);
    printf("ptr: %p\\n", (void*)ptr);
    
    *ptr = 200;
    printf("val after deref: %d\\n", val);
    return 0;
}`
  },
  {
    id: "factorial",
    name: "Factorial (Recursion)",
    category: "algorithms",
    code: `#include <stdio.h>

int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

int main() {
    int num = 4;
    int result = factorial(num);
    printf("Factorial: %d\\n", result);
    return 0;
}`
  },
  {
    id: "fibonacci",
    name: "Fibonacci Loop",
    category: "basic",
    code: `#include <stdio.h>

int main() {
    int n = 5;
    int t1 = 0, t2 = 1;
    int nextTerm;
    
    for (int i = 1; i <= n; ++i) {
        nextTerm = t1 + t2;
        t1 = t2;
        t2 = nextTerm;
    }
    return 0;
}`
  },
  {
    id: "palindrome",
    name: "Palindrome String",
    category: "basic",
    code: `#include <stdio.h>
#include <string.h>

int main() {
    char str[] = "radar";
    int len = 5;
    int isPalindrome = 1;
    
    for (int i = 0; i < len / 2; i++) {
        if (str[i] != str[len - i - 1]) {
            isPalindrome = 0;
            break;
        }
    }
    return 0;
}`
  },
  {
    id: "bubble_sort",
    name: "Bubble Sort",
    category: "algorithms",
    code: `#include <stdio.h>

int main() {
    int arr[] = {5, 2, 8, 1, 9};
    int n = 5;
    
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return 0;
}`
  },
  {
    id: "binary_search",
    name: "Binary Search",
    category: "algorithms",
    code: `#include <stdio.h>

int main() {
    int arr[] = {2, 5, 8, 12, 16, 23, 38};
    int n = 7;
    int target = 16;
    int low = 0, high = n - 1;
    int foundIndex = -1;
    
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) {
            foundIndex = mid;
            break;
        }
        if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return 0;
}`
  },
  {
    id: "linked_list",
    name: "Linked List (Malloc)",
    category: "structures",
    code: `#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node* next;
};

int main() {
    struct Node* head = NULL;
    struct Node* temp1 = malloc(sizeof(struct Node));
    temp1->data = 10;
    temp1->next = NULL;
    head = temp1;
    
    struct Node* temp2 = malloc(sizeof(struct Node));
    temp2->data = 20;
    temp2->next = NULL;
    temp1->next = temp2;
    
    return 0;
}`
  },
  {
    id: "dynamic_mem",
    name: "Dynamic Memory Heap",
    category: "advanced",
    code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int* ptr = malloc(2 * sizeof(int));
    ptr[0] = 50;
    ptr[1] = 100;
    
    free(ptr);
    return 0;
}`
  },
  {
    id: "structures",
    name: "Structures (Structs)",
    category: "structures",
    code: `#include <stdio.h>

struct Point {
    int x;
    int y;
};

int main() {
    struct Point p1;
    p1.x = 10;
    p1.y = 20;
    return 0;
}`
  }
];

// High fidelity trace generator
export function getExampleTrace(id: string): ExecutionStep[] {
  const steps: ExecutionStep[] = [];

  if (id === "hello_world") {
    steps.push({
      line: 3,
      explanation: "The program begins execution at the start of the main() function.",
      variables: [],
      stack: [{ id: "s1", functionName: "main", parameters: [], localVariables: [] }],
      heap: [],
      console: "",
      highlights: { line: 3 },
      expressionSteps: ["main() called"]
    });

    steps.push({
      line: 4,
      explanation: "printf() prints the string 'Hello, World!' onto the standard console output.",
      variables: [],
      stack: [{ id: "s1", functionName: "main", parameters: [], localVariables: [] }],
      heap: [],
      console: "Hello, World!\n",
      highlights: { line: 4 },
      expressionSteps: ["printf(\"Hello, World!\\n\")"]
    });

    steps.push({
      line: 5,
      explanation: "The return statement ends the main() function and returns 0 to the operating system, indicating successful completion.",
      variables: [],
      stack: [{ id: "s1", functionName: "main", parameters: [], localVariables: [], returnValue: "0" }],
      heap: [],
      console: "Hello, World!\n",
      highlights: { line: 5 },
      expressionSteps: ["return 0"],
      quiz: {
        question: "What does returning 0 from the main function represent?",
        options: [
          "The program failed with errors",
          "The program completed successfully with no errors",
          "The program requires external inputs",
          "The program is suspended"
        ],
        correctIndex: 1,
        explanation: "In C, a return value of 0 from main() signals to the operating system that the program executed and terminated successfully.",
        type: "output"
      }
    });

  } else if (id === "pointers") {
    // line 3: int val = 100
    steps.push({
      line: 4,
      explanation: "An integer variable named 'val' is declared in main's stack frame and initialized to 100.",
      variables: [{ id: "v1", name: "val", type: "int", value: "100", address: 0x1000, scope: "main" }],
      stack: [{ id: "s1", functionName: "main", parameters: [], localVariables: [{ id: "v1", name: "val", type: "int", value: "100", address: 0x1000, scope: "main" }] }],
      heap: [],
      console: "",
      highlights: { line: 4, variables: ["val"] },
      expressionSteps: ["val = 100"],
      arrayData: []
    });

    // line 4: int* ptr = &val
    steps.push({
      line: 5,
      explanation: "A pointer variable named 'ptr' is declared. It is initialized to stores the memory address of 'val' (0x1000).",
      variables: [
        { id: "v1", name: "val", type: "int", value: "100", address: 0x1000, scope: "main" },
        { id: "v2", name: "ptr", type: "int*", value: "0x1000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x1000 }
      ],
      stack: [{
        id: "s1", functionName: "main", parameters: [], localVariables: [
          { id: "v1", name: "val", type: "int", value: "100", address: 0x1000, scope: "main" },
          { id: "v2", name: "ptr", type: "int*", value: "0x1000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x1000 }
        ]
      }],
      heap: [],
      console: "",
      highlights: { line: 5, variables: ["ptr"] },
      expressionSteps: ["&val -> 0x1000", "ptr = 0x1000"]
    });

    // line 7: printf("val: %d\n", val)
    steps.push({
      line: 7,
      explanation: "The value of 'val' is read from memory and printed to the console.",
      variables: [
        { id: "v1", name: "val", type: "int", value: "100", address: 0x1000, scope: "main" },
        { id: "v2", name: "ptr", type: "int*", value: "0x1000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x1000 }
      ],
      stack: [{
        id: "s1", functionName: "main", parameters: [], localVariables: [
          { id: "v1", name: "val", type: "int", value: "100", address: 0x1000, scope: "main" },
          { id: "v2", name: "ptr", type: "int*", value: "0x1000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x1000 }
        ]
      }],
      heap: [],
      console: "val: 100\n",
      highlights: { line: 7 },
      expressionSteps: ["val -> 100", "printf(\"val: 100\")"]
    });

    // line 8: printf("ptr: %p\n", (void*)ptr)
    steps.push({
      line: 8,
      explanation: "The pointer 'ptr' stores the memory address 0x1000. We print this address (formatted as %p).",
      variables: [
        { id: "v1", name: "val", type: "int", value: "100", address: 0x1000, scope: "main" },
        { id: "v2", name: "ptr", type: "int*", value: "0x1000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x1000 }
      ],
      stack: [{
        id: "s1", functionName: "main", parameters: [], localVariables: [
          { id: "v1", name: "val", type: "int", value: "100", address: 0x1000, scope: "main" },
          { id: "v2", name: "ptr", type: "int*", value: "0x1000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x1000 }
        ]
      }],
      heap: [],
      console: "val: 100\nptr: 0x1000\n",
      highlights: { line: 8 },
      expressionSteps: ["ptr -> 0x1000", "printf(\"ptr: 0x1000\")"]
    });

    // line 10: *ptr = 200
    steps.push({
      line: 10,
      explanation: "We dereference 'ptr' using the '*' operator. This writes the value 200 directly to the memory address stored in 'ptr' (0x1000), which belongs to 'val'.",
      variables: [
        { id: "v1", name: "val", type: "int", value: "200", address: 0x1000, scope: "main", isUpdated: true },
        { id: "v2", name: "ptr", type: "int*", value: "0x1000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x1000 }
      ],
      stack: [{
        id: "s1", functionName: "main", parameters: [], localVariables: [
          { id: "v1", name: "val", type: "int", value: "200", address: 0x1000, scope: "main", isUpdated: true },
          { id: "v2", name: "ptr", type: "int*", value: "0x1000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x1000 }
        ]
      }],
      heap: [],
      console: "val: 100\nptr: 0x1000\n",
      highlights: { line: 10, variables: ["val"] },
      expressionSteps: ["*ptr -> target: 0x1000", "*0x1000 = 200", "val updated to 200"],
      quiz: {
        question: "What did the dereferencing operation (*ptr = 200) do?",
        options: [
          "Changed the address stored inside 'ptr'",
          "Created a new variable named ptr",
          "Changed the value of the memory cell that 'ptr' points to ('val')",
          "Allocated new heap memory"
        ],
        correctIndex: 2,
        explanation: "Dereferencing a pointer (`*ptr`) targets the memory cell that the pointer refers to, thereby editing its value directly.",
        type: "variable"
      }
    });

    // line 11: printf("val after deref: %d\n", val)
    steps.push({
      line: 11,
      explanation: "We print 'val' again. Notice that its value has changed to 200 because we modified it via the pointer 'ptr'.",
      variables: [
        { id: "v1", name: "val", type: "int", value: "200", address: 0x1000, scope: "main" },
        { id: "v2", name: "ptr", type: "int*", value: "0x1000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x1000 }
      ],
      stack: [{
        id: "s1", functionName: "main", parameters: [], localVariables: [
          { id: "v1", name: "val", type: "int", value: "200", address: 0x1000, scope: "main" },
          { id: "v2", name: "ptr", type: "int*", value: "0x1000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x1000 }
        ]
      }],
      heap: [],
      console: "val: 100\nptr: 0x1000\nval after deref: 200\n",
      highlights: { line: 11 },
      expressionSteps: ["val -> 200", "printf(\"val after deref: 200\")"]
    });

  } else if (id === "factorial") {
    // main line 10
    steps.push({
      line: 11,
      explanation: "Main starts. An integer 'num' is declared with value 4.",
      variables: [{ id: "num", name: "num", type: "int", value: "4", address: 0x1000, scope: "main" }],
      stack: [{ id: "main", functionName: "main", parameters: [], localVariables: [{ id: "num", name: "num", type: "int", value: "4", address: 0x1000, scope: "main" }] }],
      heap: [],
      console: "",
      highlights: { line: 11, variables: ["num"] },
      expressionSteps: ["num = 4"]
    });

    // Calling factorial(4)
    steps.push({
      line: 3,
      explanation: "Function factorial(n) is called with n = 4. A new stack frame is pushed.",
      variables: [
        { id: "num", name: "num", type: "int", value: "4", address: 0x1000, scope: "main" },
        { id: "f4", name: "n", type: "int", value: "4", address: 0x1004, scope: "factorial" }
      ],
      stack: [
        { id: "main", functionName: "main", parameters: [], localVariables: [{ id: "num", name: "num", type: "int", value: "4", address: 0x1000, scope: "main" }] },
        { id: "sf_4", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "4" }], localVariables: [{ id: "f4", name: "n", type: "int", value: "4", address: 0x1004, scope: "factorial" }] }
      ],
      heap: [],
      console: "",
      highlights: { line: 3 },
      expressionSteps: ["factorial(4) called"]
    });

    // Check condition n <= 1
    steps.push({
      line: 4,
      explanation: "Evaluate base case condition (n <= 1). 4 <= 1 is FALSE, so we skip the if block.",
      variables: [
        { id: "num", name: "num", type: "int", value: "4", address: 0x1000, scope: "main" },
        { id: "f4", name: "n", type: "int", value: "4", address: 0x1004, scope: "factorial" }
      ],
      stack: [
        { id: "main", functionName: "main", parameters: [], localVariables: [{ id: "num", name: "num", type: "int", value: "4", address: 0x1000, scope: "main" }] },
        { id: "sf_4", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "4" }], localVariables: [{ id: "f4", name: "n", type: "int", value: "4", address: 0x1004, scope: "factorial" }] }
      ],
      heap: [],
      console: "",
      highlights: { line: 4 },
      expressionSteps: ["n <= 1 -> 4 <= 1 -> FALSE"]
    });

    // Call factorial(3)
    steps.push({
      line: 3,
      explanation: "Recurse: Calling factorial(3) to compute 4 * factorial(3). A new stack frame is pushed.",
      variables: [
        { id: "f3", name: "n", type: "int", value: "3", address: 0x1008, scope: "factorial" }
      ],
      stack: [
        { id: "main", functionName: "main", parameters: [], localVariables: [{ id: "num", name: "num", type: "int", value: "4", address: 0x1000, scope: "main" }] },
        { id: "sf_4", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "4" }], localVariables: [{ id: "f4", name: "n", type: "int", value: "4", address: 0x1004, scope: "factorial" }] },
        { id: "sf_3", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "3" }], localVariables: [{ id: "f3", name: "n", type: "int", value: "3", address: 0x1008, scope: "factorial" }] }
      ],
      heap: [],
      console: "",
      highlights: { line: 3 },
      expressionSteps: ["n - 1 -> 3", "factorial(3) called"]
    });

    // Call factorial(2)
    steps.push({
      line: 3,
      explanation: "Recurse: Calling factorial(2) to compute 3 * factorial(2). A third stack frame is pushed.",
      variables: [
        { id: "f2", name: "n", type: "int", value: "2", address: 0x100C, scope: "factorial" }
      ],
      stack: [
        { id: "main", functionName: "main", parameters: [], localVariables: [{ id: "num", name: "num", type: "int", value: "4", address: 0x1000, scope: "main" }] },
        { id: "sf_4", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "4" }], localVariables: [{ id: "f4", name: "n", type: "int", value: "4", address: 0x1004, scope: "factorial" }] },
        { id: "sf_3", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "3" }], localVariables: [{ id: "f3", name: "n", type: "int", value: "3", address: 0x1008, scope: "factorial" }] },
        { id: "sf_2", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "2" }], localVariables: [{ id: "f2", name: "n", type: "int", value: "2", address: 0x100C, scope: "factorial" }] }
      ],
      heap: [],
      console: "",
      highlights: { line: 3 },
      expressionSteps: ["n - 1 -> 2", "factorial(2) called"]
    });

    // Call factorial(1) - Base case
    steps.push({
      line: 3,
      explanation: "Recurse: Calling factorial(1) to compute 2 * factorial(1). A fourth stack frame is pushed.",
      variables: [
        { id: "f1", name: "n", type: "int", value: "1", address: 0x1010, scope: "factorial" }
      ],
      stack: [
        { id: "main", functionName: "main", parameters: [], localVariables: [{ id: "num", name: "num", type: "int", value: "4", address: 0x1000, scope: "main" }] },
        { id: "sf_4", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "4" }], localVariables: [{ id: "f4", name: "n", type: "int", value: "4", address: 0x1004, scope: "factorial" }] },
        { id: "sf_3", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "3" }], localVariables: [{ id: "f3", name: "n", type: "int", value: "3", address: 0x1008, scope: "factorial" }] },
        { id: "sf_2", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "2" }], localVariables: [{ id: "f2", name: "n", type: "int", value: "2", address: 0x100C, scope: "factorial" }] },
        { id: "sf_1", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "1" }], localVariables: [{ id: "f1", name: "n", type: "int", value: "1", address: 0x1010, scope: "factorial" }] }
      ],
      heap: [],
      console: "",
      highlights: { line: 3 },
      expressionSteps: ["n - 1 -> 1", "factorial(1) called"]
    });

    // line 4 check base case
    steps.push({
      line: 4,
      explanation: "Evaluate base case (n <= 1) for factorial(1). 1 <= 1 is TRUE. This triggers the base case return!",
      variables: [
        { id: "f1", name: "n", type: "int", value: "1", address: 0x1010, scope: "factorial" }
      ],
      stack: [
        { id: "main", functionName: "main", parameters: [], localVariables: [{ id: "num", name: "num", type: "int", value: "4", address: 0x1000, scope: "main" }] },
        { id: "sf_4", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "4" }], localVariables: [{ id: "f4", name: "n", type: "int", value: "4", address: 0x1004, scope: "factorial" }] },
        { id: "sf_3", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "3" }], localVariables: [{ id: "f3", name: "n", type: "int", value: "3", address: 0x1008, scope: "factorial" }] },
        { id: "sf_2", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "2" }], localVariables: [{ id: "f2", name: "n", type: "int", value: "2", address: 0x100C, scope: "factorial" }] },
        { id: "sf_1", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "1" }], localVariables: [{ id: "f1", name: "n", type: "int", value: "1", address: 0x1010, scope: "factorial" }] }
      ],
      heap: [],
      console: "",
      highlights: { line: 4 },
      expressionSteps: ["n <= 1 -> 1 <= 1 -> TRUE"]
    });

    // Return 1 from factorial(1)
    steps.push({
      line: 5,
      explanation: "Base case matched. factorial(1) returns 1. The top stack frame is popped.",
      variables: [],
      stack: [
        { id: "main", functionName: "main", parameters: [], localVariables: [{ id: "num", name: "num", type: "int", value: "4", address: 0x1000, scope: "main" }] },
        { id: "sf_4", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "4" }], localVariables: [{ id: "f4", name: "n", type: "int", value: "4", address: 0x1004, scope: "factorial" }] },
        { id: "sf_3", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "3" }], localVariables: [{ id: "f3", name: "n", type: "int", value: "3", address: 0x1008, scope: "factorial" }] },
        { id: "sf_2", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "2" }], localVariables: [{ id: "f2", name: "n", type: "int", value: "2", address: 0x100C, scope: "factorial" }], returnValue: "1" }
      ],
      heap: [],
      console: "",
      highlights: { line: 5 },
      expressionSteps: ["factorial(1) returns 1"],
      quiz: {
        question: "How many active function calls are stored in the stack right now?",
        options: [
          "2 active frames",
          "3 active frames",
          "4 active frames (including main)",
          "1 active frame"
        ],
        correctIndex: 2,
        explanation: "Before returning, the stack holds frames for main(), factorial(4), factorial(3), and factorial(2). The frame for factorial(1) has just popped.",
        type: "output"
      }
    });

    // Return 2 * 1 from factorial(2)
    steps.push({
      line: 7,
      explanation: "factorial(2) completes. It computes n * factorial(1) = 2 * 1 = 2 and returns 2.",
      variables: [],
      stack: [
        { id: "main", functionName: "main", parameters: [], localVariables: [{ id: "num", name: "num", type: "int", value: "4", address: 0x1000, scope: "main" }] },
        { id: "sf_4", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "4" }], localVariables: [{ id: "f4", name: "n", type: "int", value: "4", address: 0x1004, scope: "factorial" }] },
        { id: "sf_3", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "3" }], localVariables: [{ id: "f3", name: "n", type: "int", value: "3", address: 0x1008, scope: "factorial" }], returnValue: "2" }
      ],
      heap: [],
      console: "",
      highlights: { line: 7 },
      expressionSteps: ["n = 2", "factorial(1) = 1", "2 * 1 = 2", "factorial(2) returns 2"]
    });

    // Return 3 * 2 from factorial(3)
    steps.push({
      line: 7,
      explanation: "factorial(3) completes. It computes n * factorial(2) = 3 * 2 = 6 and returns 6.",
      variables: [],
      stack: [
        { id: "main", functionName: "main", parameters: [], localVariables: [{ id: "num", name: "num", type: "int", value: "4", address: 0x1000, scope: "main" }] },
        { id: "sf_4", functionName: "factorial", parameters: [{ name: "n", type: "int", value: "4" }], localVariables: [{ id: "f4", name: "n", type: "int", value: "4", address: 0x1004, scope: "factorial" }], returnValue: "6" }
      ],
      heap: [],
      console: "",
      highlights: { line: 7 },
      expressionSteps: ["n = 3", "factorial(2) = 2", "3 * 2 = 6", "factorial(3) returns 6"]
    });

    // Return 4 * 6 from factorial(4)
    steps.push({
      line: 7,
      explanation: "factorial(4) completes. It computes n * factorial(3) = 4 * 6 = 24 and returns 24.",
      variables: [
        { id: "num", name: "num", type: "int", value: "4", address: 0x1000, scope: "main" }
      ],
      stack: [
        { id: "main", functionName: "main", parameters: [], localVariables: [{ id: "num", name: "num", type: "int", value: "4", address: 0x1000, scope: "main" }], returnValue: "24" }
      ],
      heap: [],
      console: "",
      highlights: { line: 7 },
      expressionSteps: ["n = 4", "factorial(3) = 6", "4 * 6 = 24", "factorial(4) returns 24"]
    });

    // Store in result in main
    steps.push({
      line: 12,
      explanation: "Back in main(). The returned value 24 is stored into the local variable 'result'.",
      variables: [
        { id: "num", name: "num", type: "int", value: "4", address: 0x1000, scope: "main" },
        { id: "result", name: "result", type: "int", value: "24", address: 0x1014, scope: "main" }
      ],
      stack: [
        {
          id: "main", functionName: "main", parameters: [], localVariables: [
            { id: "num", name: "num", type: "int", value: "4", address: 0x1000, scope: "main" },
            { id: "result", name: "result", type: "int", value: "24", address: 0x1014, scope: "main" }
          ]
        }
      ],
      heap: [],
      console: "",
      highlights: { line: 12, variables: ["result"] },
      expressionSteps: ["result = 24"]
    });

    // printf
    steps.push({
      line: 13,
      explanation: "We print 'Factorial: 24' using printf().",
      variables: [
        { id: "num", name: "num", type: "int", value: "4", address: 0x1000, scope: "main" },
        { id: "result", name: "result", type: "int", value: "24", address: 0x1014, scope: "main" }
      ],
      stack: [
        {
          id: "main", functionName: "main", parameters: [], localVariables: [
            { id: "num", name: "num", type: "int", value: "4", address: 0x1000, scope: "main" },
            { id: "result", name: "result", type: "int", value: "24", address: 0x1014, scope: "main" }
          ]
        }
      ],
      heap: [],
      console: "Factorial: 24\n",
      highlights: { line: 13 },
      expressionSteps: ["printf(\"Factorial: 24\")"]
    });

  } else if (id === "bubble_sort") {
    // Trace of bubble sort
    const baseArr = [5, 2, 8, 1, 9];
    steps.push({
      line: 4,
      explanation: "An integer array 'arr' of size 5 is declared on the stack containing elements: 5, 2, 8, 1, 9.",
      variables: [{ id: "arr", name: "arr", type: "int[5]", value: "[5, 2, 8, 1, 9]", address: 0x1000, scope: "main" }],
      stack: [{ id: "main", functionName: "main", parameters: [], localVariables: [{ id: "arr", name: "arr", type: "int[5]", value: "[5, 2, 8, 1, 9]", address: 0x1000, scope: "main" }] }],
      heap: [],
      console: "",
      highlights: { line: 4 },
      expressionSteps: ["arr = {5, 2, 8, 1, 9}"],
      arrayData: [{ id: "arr", name: "arr", type: "1D", dimensions: [5], data: [5, 2, 8, 1, 9] }]
    });

    // Step 2: Compare 5 and 2 (Swap happens)
    steps.push({
      line: 8,
      explanation: "We check if arr[0] (5) is greater than arr[1] (2). Since 5 > 2, they will be swapped.",
      variables: [{ id: "arr", name: "arr", type: "int[5]", value: "[5, 2, 8, 1, 9]", address: 0x1000, scope: "main" }],
      stack: [{ id: "main", functionName: "main", parameters: [], localVariables: [{ id: "arr", name: "arr", type: "int[5]", value: "[5, 2, 8, 1, 9]", address: 0x1000, scope: "main" }] }],
      heap: [],
      console: "",
      highlights: { line: 8 },
      expressionSteps: ["arr[0] > arr[1]", "5 > 2 -> TRUE"],
      arrayData: [{ id: "arr", name: "arr", type: "1D", dimensions: [5], data: [5, 2, 8, 1, 9], accessedIndices: [0, 1] }],
      sortingData: { array: [5, 2, 8, 1, 9], compareIndices: [0, 1], swapIndices: null, sortedCount: 0 }
    });

    // Swapped state
    steps.push({
      line: 11,
      explanation: "Swap completed! Elements at index 0 and 1 have been interchanged. Array is now [2, 5, 8, 1, 9].",
      variables: [{ id: "arr", name: "arr", type: "int[5]", value: "[2, 5, 8, 1, 9]", address: 0x1000, scope: "main", isUpdated: true }],
      stack: [{ id: "main", functionName: "main", parameters: [], localVariables: [{ id: "arr", name: "arr", type: "int[5]", value: "[2, 5, 8, 1, 9]", address: 0x1000, scope: "main" }] }],
      heap: [],
      console: "",
      highlights: { line: 11 },
      expressionSteps: ["temp = arr[0]", "arr[0] = arr[1]", "arr[1] = temp"],
      arrayData: [{ id: "arr", name: "arr", type: "1D", dimensions: [5], data: [2, 5, 8, 1, 9], accessedIndices: [0, 1] }],
      sortingData: { array: [2, 5, 8, 1, 9], compareIndices: [0, 1], swapIndices: [0, 1], sortedCount: 0 }
    });

    // Compare 5 and 8 (No Swap)
    steps.push({
      line: 8,
      explanation: "Compare arr[1] (5) and arr[2] (8). Since 5 < 8, they are already in order. No swap occurs.",
      variables: [{ id: "arr", name: "arr", type: "int[5]", value: "[2, 5, 8, 1, 9]", address: 0x1000, scope: "main" }],
      stack: [{ id: "main", functionName: "main", parameters: [], localVariables: [{ id: "arr", name: "arr", type: "int[5]", value: "[2, 5, 8, 1, 9]", address: 0x1000, scope: "main" }] }],
      heap: [],
      console: "",
      highlights: { line: 8 },
      expressionSteps: ["arr[1] > arr[2]", "5 > 8 -> FALSE"],
      arrayData: [{ id: "arr", name: "arr", type: "1D", dimensions: [5], data: [2, 5, 8, 1, 9], accessedIndices: [1, 2] }],
      sortingData: { array: [2, 5, 8, 1, 9], compareIndices: [1, 2], swapIndices: null, sortedCount: 0 }
    });

    // Compare 8 and 1 (Swap)
    steps.push({
      line: 8,
      explanation: "Compare arr[2] (8) and arr[3] (1). 8 > 1 is TRUE. They will be swapped.",
      variables: [{ id: "arr", name: "arr", type: "int[5]", value: "[2, 5, 8, 1, 9]", address: 0x1000, scope: "main" }],
      stack: [{ id: "main", functionName: "main", parameters: [], localVariables: [{ id: "arr", name: "arr", type: "int[5]", value: "[2, 5, 8, 1, 9]", address: 0x1000, scope: "main" }] }],
      heap: [],
      console: "",
      highlights: { line: 8 },
      expressionSteps: ["arr[2] > arr[3]", "8 > 1 -> TRUE"],
      arrayData: [{ id: "arr", name: "arr", type: "1D", dimensions: [5], data: [2, 5, 8, 1, 9], accessedIndices: [2, 3] }],
      sortingData: { array: [2, 5, 8, 1, 9], compareIndices: [2, 3], swapIndices: null, sortedCount: 0 }
    });

    steps.push({
      line: 11,
      explanation: "Swap completed! Elements at index 2 and 3 are interchanged. Array is now [2, 5, 1, 8, 9].",
      variables: [{ id: "arr", name: "arr", type: "int[5]", value: "[2, 5, 1, 8, 9]", address: 0x1000, scope: "main", isUpdated: true }],
      stack: [{ id: "main", functionName: "main", parameters: [], localVariables: [{ id: "arr", name: "arr", type: "int[5]", value: "[2, 5, 1, 8, 9]", address: 0x1000, scope: "main" }] }],
      heap: [],
      console: "",
      highlights: { line: 11 },
      expressionSteps: ["arr[2] = 1", "arr[3] = 8"],
      arrayData: [{ id: "arr", name: "arr", type: "1D", dimensions: [5], data: [2, 5, 1, 8, 9], accessedIndices: [2, 3] }],
      sortingData: { array: [2, 5, 1, 8, 9], compareIndices: [2, 3], swapIndices: [2, 3], sortedCount: 0 }
    });

    // Final sorted look
    steps.push({
      line: 15,
      explanation: "The sorting process finishes. The list is sorted in ascending order: [1, 2, 5, 8, 9].",
      variables: [{ id: "arr", name: "arr", type: "int[5]", value: "[1, 2, 5, 8, 9]", address: 0x1000, scope: "main" }],
      stack: [{ id: "main", functionName: "main", parameters: [], localVariables: [{ id: "arr", name: "arr", type: "int[5]", value: "[1, 2, 5, 8, 9]", address: 0x1000, scope: "main" }] }],
      heap: [],
      console: "Sorting completed!\n",
      highlights: { line: 15 },
      expressionSteps: ["return 0"],
      arrayData: [{ id: "arr", name: "arr", type: "1D", dimensions: [5], data: [1, 2, 5, 8, 9] }],
      sortingData: { array: [1, 2, 5, 8, 9], compareIndices: null, swapIndices: null, sortedCount: 5 }
    });

  } else if (id === "binary_search") {
    const list = [2, 5, 8, 12, 16, 23, 38];
    // Start step
    steps.push({
      line: 4,
      explanation: "Declare target = 16, low = 0, high = 6 (last index of array).",
      variables: [
        { id: "target", name: "target", type: "int", value: "16", address: 0x1020, scope: "main" },
        { id: "low", name: "low", type: "int", value: "0", address: 0x1024, scope: "main" },
        { id: "high", name: "high", type: "int", value: "6", address: 0x1028, scope: "main" }
      ],
      stack: [{
        id: "main", functionName: "main", parameters: [], localVariables: [
          { id: "target", name: "target", type: "int", value: "16", address: 0x1020, scope: "main" },
          { id: "low", name: "low", type: "int", value: "0", address: 0x1024, scope: "main" },
          { id: "high", name: "high", type: "int", value: "6", address: 0x1028, scope: "main" }
        ]
      }],
      heap: [],
      console: "",
      highlights: { line: 8 },
      expressionSteps: ["target = 16", "low = 0", "high = 6"],
      arrayData: [{ id: "arr", name: "arr", type: "1D", dimensions: [7], data: list, accessedIndices: [] }],
      searchingData: { array: list, target: 16, low: 0, high: 6, mid: -1, found: null }
    });

    // Iteration 1: mid = 3, val = 12
    steps.push({
      line: 11,
      explanation: "Calculate mid index: mid = low + (high - low)/2 = 0 + (6)/2 = 3. arr[3] is 12.",
      variables: [
        { id: "target", name: "target", type: "int", value: "16", address: 0x1020, scope: "main" },
        { id: "low", name: "low", type: "int", value: "0", address: 0x1024, scope: "main" },
        { id: "high", name: "high", type: "int", value: "6", address: 0x1028, scope: "main" },
        { id: "mid", name: "mid", type: "int", value: "3", address: 0x102C, scope: "main" }
      ],
      stack: [{
        id: "main", functionName: "main", parameters: [], localVariables: [
          { id: "target", name: "target", type: "int", value: "16", address: 0x1020, scope: "main" },
          { id: "low", name: "low", type: "int", value: "0", address: 0x1024, scope: "main" },
          { id: "high", name: "high", type: "int", value: "6", address: 0x1028, scope: "main" },
          { id: "mid", name: "mid", type: "int", value: "3", address: 0x102C, scope: "main" }
        ]
      }],
      heap: [],
      console: "",
      highlights: { line: 11 },
      expressionSteps: ["mid = 3", "arr[3] -> 12"],
      arrayData: [{ id: "arr", name: "arr", type: "1D", dimensions: [7], data: list, accessedIndices: [3] }],
      searchingData: { array: list, target: 16, low: 0, high: 6, mid: 3, found: null }
    });

    // Condition check: 12 < 16, low = mid + 1
    steps.push({
      line: 16,
      explanation: "Since arr[3] (12) is less than target (16), we narrow the search space to the right half. low becomes mid + 1 = 4.",
      variables: [
        { id: "target", name: "target", type: "int", value: "16", address: 0x1020, scope: "main" },
        { id: "low", name: "low", type: "int", value: "4", address: 0x1024, scope: "main", isUpdated: true },
        { id: "high", name: "high", type: "int", value: "6", address: 0x1028, scope: "main" }
      ],
      stack: [{
        id: "main", functionName: "main", parameters: [], localVariables: [
          { id: "target", name: "target", type: "int", value: "16", address: 0x1020, scope: "main" },
          { id: "low", name: "low", type: "int", value: "4", address: 0x1024, scope: "main" },
          { id: "high", name: "high", type: "int", value: "6", address: 0x1028, scope: "main" }
        ]
      }],
      heap: [],
      console: "",
      highlights: { line: 17 },
      expressionSteps: ["arr[3] < 16 -> 12 < 16 -> TRUE", "low = 3 + 1 -> 4"],
      arrayData: [{ id: "arr", name: "arr", type: "1D", dimensions: [7], data: list, accessedIndices: [] }],
      searchingData: { array: list, target: 16, low: 4, high: 6, mid: -1, found: null },
      quiz: {
        question: "Why did low become mid + 1 instead of high becoming mid - 1?",
        options: [
          "Because the list is unsorted",
          "Because target (16) is greater than the middle element (12)",
          "Because target was not in the array",
          "To exit the search loop early"
        ],
        correctIndex: 1,
        explanation: "In binary search on an ascending sorted array, if the target is greater than the middle item, it must lie in the right sub-array, so we advance `low` to `mid + 1`.",
        type: "output"
      }
    });

    // Iteration 2: mid = 5, value = 23
    steps.push({
      line: 11,
      explanation: "Calculate mid index: mid = low + (high - low)/2 = 4 + (6 - 4)/2 = 5. arr[5] is 23.",
      variables: [
        { id: "target", name: "target", type: "int", value: "16", address: 0x1020, scope: "main" },
        { id: "low", name: "low", type: "int", value: "4", address: 0x1024, scope: "main" },
        { id: "high", name: "high", type: "int", value: "6", address: 0x1028, scope: "main" },
        { id: "mid", name: "mid", type: "int", value: "5", address: 0x102C, scope: "main" }
      ],
      stack: [{
        id: "main", functionName: "main", parameters: [], localVariables: [
          { id: "target", name: "target", type: "int", value: "16", address: 0x1020, scope: "main" },
          { id: "low", name: "low", type: "int", value: "4", address: 0x1024, scope: "main" },
          { id: "high", name: "high", type: "int", value: "6", address: 0x1028, scope: "main" },
          { id: "mid", name: "mid", type: "int", value: "5", address: 0x102C, scope: "main" }
        ]
      }],
      heap: [],
      console: "",
      highlights: { line: 11 },
      expressionSteps: ["mid = 5", "arr[5] -> 23"],
      arrayData: [{ id: "arr", name: "arr", type: "1D", dimensions: [7], data: list, accessedIndices: [5] }],
      searchingData: { array: list, target: 16, low: 4, high: 6, mid: 5, found: null }
    });

    // Condition: 23 > 16, high = mid - 1 = 4
    steps.push({
      line: 18,
      explanation: "Since arr[5] (23) is greater than target (16), we look in the left sub-array. high becomes mid - 1 = 4.",
      variables: [
        { id: "target", name: "target", type: "int", value: "16", address: 0x1020, scope: "main" },
        { id: "low", name: "low", type: "int", value: "4", address: 0x1024, scope: "main" },
        { id: "high", name: "high", type: "int", value: "4", address: 0x1028, scope: "main", isUpdated: true }
      ],
      stack: [{
        id: "main", functionName: "main", parameters: [], localVariables: [
          { id: "target", name: "target", type: "int", value: "16", address: 0x1020, scope: "main" },
          { id: "low", name: "low", type: "int", value: "4", address: 0x1024, scope: "main" },
          { id: "high", name: "high", type: "int", value: "4", address: 0x1028, scope: "main" }
        ]
      }],
      heap: [],
      console: "",
      highlights: { line: 19 },
      expressionSteps: ["arr[5] > 16 -> 23 > 16 -> TRUE", "high = 5 - 1 -> 4"],
      arrayData: [{ id: "arr", name: "arr", type: "1D", dimensions: [7], data: list, accessedIndices: [] }],
      searchingData: { array: list, target: 16, low: 4, high: 4, mid: -1, found: null }
    });

    // Iteration 3: mid = 4, value = 16 (Found!)
    steps.push({
      line: 11,
      explanation: "Calculate mid index: mid = low + (high - low)/2 = 4 + (4-4)/2 = 4. arr[4] is 16.",
      variables: [
        { id: "target", name: "target", type: "int", value: "16", address: 0x1020, scope: "main" },
        { id: "low", name: "low", type: "int", value: "4", address: 0x1024, scope: "main" },
        { id: "high", name: "high", type: "int", value: "4", address: 0x1028, scope: "main" },
        { id: "mid", name: "mid", type: "int", value: "4", address: 0x102C, scope: "main" }
      ],
      stack: [{
        id: "main", functionName: "main", parameters: [], localVariables: [
          { id: "target", name: "target", type: "int", value: "16", address: 0x1020, scope: "main" },
          { id: "low", name: "low", type: "int", value: "4", address: 0x1024, scope: "main" },
          { id: "high", name: "high", type: "int", value: "4", address: 0x1028, scope: "main" },
          { id: "mid", name: "mid", type: "int", value: "4", address: 0x102C, scope: "main" }
        ]
      }],
      heap: [],
      console: "",
      highlights: { line: 11 },
      expressionSteps: ["mid = 4", "arr[4] -> 16"],
      arrayData: [{ id: "arr", name: "arr", type: "1D", dimensions: [7], data: list, accessedIndices: [4] }],
      searchingData: { array: list, target: 16, low: 4, high: 4, mid: 4, found: true }
    });

    steps.push({
      line: 12,
      explanation: "Match found! arr[4] == target (16 == 16). We set foundIndex = 4 and break.",
      variables: [
        { id: "target", name: "target", type: "int", value: "16", address: 0x1020, scope: "main" },
        { id: "foundIndex", name: "foundIndex", type: "int", value: "4", address: 0x1030, scope: "main", isUpdated: true }
      ],
      stack: [{
        id: "main", functionName: "main", parameters: [], localVariables: [
          { id: "target", name: "target", type: "int", value: "16", address: 0x1020, scope: "main" },
          { id: "foundIndex", name: "foundIndex", type: "int", value: "4", address: 0x1030, scope: "main" }
        ]
      }],
      heap: [],
      console: "Target 16 found at index 4!\n",
      highlights: { line: 13 },
      expressionSteps: ["arr[4] == target -> TRUE", "foundIndex = 4", "break"],
      arrayData: [{ id: "arr", name: "arr", type: "1D", dimensions: [7], data: list, accessedIndices: [4] }],
      searchingData: { array: list, target: 16, low: 4, high: 4, mid: 4, found: true }
    });

  } else if (id === "linked_list") {
    // Linked List Step 1
    steps.push({
      line: 10,
      explanation: "Initial state: A struct Node* named 'head' is declared and initialized to NULL.",
      variables: [
        { id: "head", name: "head", type: "struct Node*", value: "NULL (0x0)", address: 0x1000, scope: "main" }
      ],
      stack: [{ id: "main", functionName: "main", parameters: [], localVariables: [{ id: "head", name: "head", type: "struct Node*", value: "NULL (0x0)", address: 0x1000, scope: "main" }] }],
      heap: [],
      console: "",
      highlights: { line: 10, variables: ["head"] },
      expressionSteps: ["head = NULL"],
      listData: { nodes: [] }
    });

    // Step 2: Malloc Node 1
    steps.push({
      line: 11,
      explanation: "malloc() allocates a block on the Heap. A chunk of 16 bytes is reserved at address 0x3000.",
      variables: [
        { id: "head", name: "head", type: "struct Node*", value: "NULL (0x0)", address: 0x1000, scope: "main" },
        { id: "temp1", name: "temp1", type: "struct Node*", value: "0x3000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x3000 }
      ],
      stack: [{
        id: "main", functionName: "main", parameters: [], localVariables: [
          { id: "head", name: "head", type: "struct Node*", value: "NULL (0x0)", address: 0x1000, scope: "main" },
          { id: "temp1", name: "temp1", type: "struct Node*", value: "0x3000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x3000 }
        ]
      }],
      heap: [
        { id: "node1", address: 0x3000, size: 16, type: "struct Node", value: ["?", "NULL"], isFree: false }
      ],
      console: "",
      highlights: { line: 11, variables: ["temp1"] },
      expressionSteps: ["malloc(sizeof(struct Node)) -> 0x3000", "temp1 = 0x3000"],
      listData: { nodes: [{ id: "n1", val: 0, addr: 0x3000, nextAddr: 0 }] }
    });

    // Step 3: Set temp1->data = 10
    steps.push({
      line: 12,
      explanation: "Write the integer value 10 into the 'data' field of the struct Node located at 0x3000.",
      variables: [
        { id: "head", name: "head", type: "struct Node*", value: "NULL (0x0)", address: 0x1000, scope: "main" },
        { id: "temp1", name: "temp1", type: "struct Node*", value: "0x3000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x3000 }
      ],
      stack: [{
        id: "main", functionName: "main", parameters: [], localVariables: [
          { id: "head", name: "head", type: "struct Node*", value: "NULL (0x0)", address: 0x1000, scope: "main" },
          { id: "temp1", name: "temp1", type: "struct Node*", value: "0x3000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x3000 }
        ]
      }],
      heap: [
        { id: "node1", address: 0x3000, size: 16, type: "struct Node", value: ["10", "NULL"], isFree: false }
      ],
      console: "",
      highlights: { line: 12 },
      expressionSteps: ["temp1->data = 10"],
      listData: { nodes: [{ id: "n1", val: 10, addr: 0x3000, nextAddr: 0 }] }
    });

    // Step 4: head = temp1
    steps.push({
      line: 14,
      explanation: "Set head = temp1. The 'head' pointer now stores 0x3000 and points directly to our first node.",
      variables: [
        { id: "head", name: "head", type: "struct Node*", value: "0x3000", address: 0x1000, scope: "main", isPointer: true, pointsTo: 0x3000 },
        { id: "temp1", name: "temp1", type: "struct Node*", value: "0x3000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x3000 }
      ],
      stack: [{
        id: "main", functionName: "main", parameters: [], localVariables: [
          { id: "head", name: "head", type: "struct Node*", value: "0x3000", address: 0x1000, scope: "main", isPointer: true, pointsTo: 0x3000 },
          { id: "temp1", name: "temp1", type: "struct Node*", value: "0x3000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x3000 }
        ]
      }],
      heap: [
        { id: "node1", address: 0x3000, size: 16, type: "struct Node", value: ["10", "NULL"], isFree: false }
      ],
      console: "",
      highlights: { line: 14, variables: ["head"] },
      expressionSteps: ["head = 0x3000"],
      listData: { nodes: [{ id: "n1", val: 10, addr: 0x3000, nextAddr: 0 }] }
    });

    // Step 5: Malloc Node 2
    steps.push({
      line: 16,
      explanation: "malloc() allocates another Node on the Heap. It receives address 0x3010.",
      variables: [
        { id: "head", name: "head", type: "struct Node*", value: "0x3000", address: 0x1000, scope: "main", isPointer: true, pointsTo: 0x3000 },
        { id: "temp1", name: "temp1", type: "struct Node*", value: "0x3000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x3000 },
        { id: "temp2", name: "temp2", type: "struct Node*", value: "0x3010", address: 0x1008, scope: "main", isPointer: true, pointsTo: 0x3010 }
      ],
      stack: [{
        id: "main", functionName: "main", parameters: [], localVariables: [
          { id: "head", name: "head", type: "struct Node*", value: "0x3000", address: 0x1000, scope: "main", isPointer: true, pointsTo: 0x3000 },
          { id: "temp1", name: "temp1", type: "struct Node*", value: "0x3000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x3000 },
          { id: "temp2", name: "temp2", type: "struct Node*", value: "0x3010", address: 0x1008, scope: "main", isPointer: true, pointsTo: 0x3010 }
        ]
      }],
      heap: [
        { id: "node1", address: 0x3000, size: 16, type: "struct Node", value: ["10", "NULL"], isFree: false },
        { id: "node2", address: 0x3010, size: 16, type: "struct Node", value: ["?", "NULL"], isFree: false }
      ],
      console: "",
      highlights: { line: 16, variables: ["temp2"] },
      expressionSteps: ["malloc(sizeof(struct Node)) -> 0x3010", "temp2 = 0x3010"],
      listData: {
        nodes: [
          { id: "n1", val: 10, addr: 0x3000, nextAddr: 0 },
          { id: "n2", val: 0, addr: 0x3010, nextAddr: 0 }
        ]
      }
    });

    // Step 6: Set temp2->data = 20
    steps.push({
      line: 17,
      explanation: "Set the data field of node 2 (0x3010) to 20.",
      variables: [
        { id: "head", name: "head", type: "struct Node*", value: "0x3000", address: 0x1000, scope: "main", isPointer: true, pointsTo: 0x3000 },
        { id: "temp1", name: "temp1", type: "struct Node*", value: "0x3000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x3000 },
        { id: "temp2", name: "temp2", type: "struct Node*", value: "0x3010", address: 0x1008, scope: "main", isPointer: true, pointsTo: 0x3010 }
      ],
      stack: [{
        id: "main", functionName: "main", parameters: [], localVariables: [
          { id: "head", name: "head", type: "struct Node*", value: "0x3000", address: 0x1000, scope: "main", isPointer: true, pointsTo: 0x3000 },
          { id: "temp1", name: "temp1", type: "struct Node*", value: "0x3000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x3000 },
          { id: "temp2", name: "temp2", type: "struct Node*", value: "0x3010", address: 0x1008, scope: "main", isPointer: true, pointsTo: 0x3010 }
        ]
      }],
      heap: [
        { id: "node1", address: 0x3000, size: 16, type: "struct Node", value: ["10", "NULL"], isFree: false },
        { id: "node2", address: 0x3010, size: 16, type: "struct Node", value: ["20", "NULL"], isFree: false }
      ],
      console: "",
      highlights: { line: 17 },
      expressionSteps: ["temp2->data = 20"],
      listData: {
        nodes: [
          { id: "n1", val: 10, addr: 0x3000, nextAddr: 0 },
          { id: "n2", val: 20, addr: 0x3010, nextAddr: 0 }
        ]
      }
    });

    // Step 7: temp1->next = temp2 (Linking!)
    steps.push({
      line: 19,
      explanation: "Link the nodes! temp1->next (at 0x3000) is set to temp2 (0x3010). Now node 1 points directly to node 2.",
      variables: [
        { id: "head", name: "head", type: "struct Node*", value: "0x3000", address: 0x1000, scope: "main", isPointer: true, pointsTo: 0x3000 },
        { id: "temp1", name: "temp1", type: "struct Node*", value: "0x3000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x3000 },
        { id: "temp2", name: "temp2", type: "struct Node*", value: "0x3010", address: 0x1008, scope: "main", isPointer: true, pointsTo: 0x3010 }
      ],
      stack: [{
        id: "main", functionName: "main", parameters: [], localVariables: [
          { id: "head", name: "head", type: "struct Node*", value: "0x3000", address: 0x1000, scope: "main", isPointer: true, pointsTo: 0x3000 },
          { id: "temp1", name: "temp1", type: "struct Node*", value: "0x3000", address: 0x1004, scope: "main", isPointer: true, pointsTo: 0x3000 },
          { id: "temp2", name: "temp2", type: "struct Node*", value: "0x3010", address: 0x1008, scope: "main", isPointer: true, pointsTo: 0x3010 }
        ]
      }],
      heap: [
        { id: "node1", address: 0x3000, size: 16, type: "struct Node", value: ["10", "0x3010"], isFree: false },
        { id: "node2", address: 0x3010, size: 16, type: "struct Node", value: ["20", "NULL"], isFree: false }
      ],
      console: "",
      highlights: { line: 19 },
      expressionSteps: ["temp1->next = 0x3010"],
      listData: {
        nodes: [
          { id: "n1", val: 10, addr: 0x3000, nextAddr: 0x3010 },
          { id: "n2", val: 20, addr: 0x3010, nextAddr: 0 }
        ]
      },
      quiz: {
        question: "What would happen if we executed free(temp1) right now without saving temp1->next?",
        options: [
          "Nothing, memory cleans up automatically",
          "We lose access to temp2 (Node 2), causing a memory leak",
          "The program will immediately crash",
          "Node 2 will be automatically linked to head"
        ],
        correctIndex: 1,
        explanation: "Since temp2 is only accessible via temp1->next (or the temporary pointer temp2), freeing temp1 first without relocating or freeing temp2 will cause a memory leak as its reference is lost.",
        type: "output"
      }
    });

  } else if (id === "dynamic_mem") {
    // Malloc int[2]
    steps.push({
      line: 5,
      explanation: "malloc() allocates a contiguous block of 8 bytes on the Heap (enough for 2 integers). It returns 0x3000.",
      variables: [
        { id: "ptr", name: "ptr", type: "int*", value: "0x3000", address: 0x1000, scope: "main", isPointer: true, pointsTo: 0x3000 }
      ],
      stack: [{ id: "main", functionName: "main", parameters: [], localVariables: [{ id: "ptr", name: "ptr", type: "int*", value: "0x3000", address: 0x1000, scope: "main", isPointer: true, pointsTo: 0x3000 }] }],
      heap: [
        { id: "h1", address: 0x3000, size: 8, type: "int[2]", value: ["?", "?"], isFree: false }
      ],
      console: "",
      highlights: { line: 5 },
      expressionSteps: ["malloc(2 * sizeof(int)) -> 0x3000", "ptr = 0x3000"],
      arrayData: [{ id: "heap_array", name: "ptr (Heap Array)", type: "1D", dimensions: [2], data: [0, 0] }]
    });

    // ptr[0] = 50
    steps.push({
      line: 6,
      explanation: "Write the integer 50 to the first cell of our dynamic array (at address 0x3000).",
      variables: [
        { id: "ptr", name: "ptr", type: "int*", value: "0x3000", address: 0x1000, scope: "main", isPointer: true, pointsTo: 0x3000 }
      ],
      stack: [{ id: "main", functionName: "main", parameters: [], localVariables: [{ id: "ptr", name: "ptr", type: "int*", value: "0x3000", address: 0x1000, scope: "main", isPointer: true, pointsTo: 0x3000 }] }],
      heap: [
        { id: "h1", address: 0x3000, size: 8, type: "int[2]", value: ["50", "?"], isFree: false }
      ],
      console: "",
      highlights: { line: 6 },
      expressionSteps: ["ptr[0] = 50"],
      arrayData: [{ id: "heap_array", name: "ptr (Heap Array)", type: "1D", dimensions: [2], data: [50, 0], accessedIndices: [0] }]
    });

    // ptr[1] = 100
    steps.push({
      line: 7,
      explanation: "Write the integer 100 to the second cell of our dynamic array (at address 0x3004).",
      variables: [
        { id: "ptr", name: "ptr", type: "int*", value: "0x3000", address: 0x1000, scope: "main", isPointer: true, pointsTo: 0x3000 }
      ],
      stack: [{ id: "main", functionName: "main", parameters: [], localVariables: [{ id: "ptr", name: "ptr", type: "int*", value: "0x3000", address: 0x1000, scope: "main", isPointer: true, pointsTo: 0x3000 }] }],
      heap: [
        { id: "h1", address: 0x3000, size: 8, type: "int[2]", value: ["50", "100"], isFree: false }
      ],
      console: "",
      highlights: { line: 7 },
      expressionSteps: ["ptr[1] = 100"],
      arrayData: [{ id: "heap_array", name: "ptr (Heap Array)", type: "1D", dimensions: [2], data: [50, 100], accessedIndices: [1] }]
    });

    // free(ptr)
    steps.push({
      line: 9,
      explanation: "We call free(ptr) to deallocate the heap memory block. The block is marked as FREE and can now be reused by other malloc requests.",
      variables: [
        { id: "ptr", name: "ptr", type: "int*", value: "0x3000 (Dangling)", address: 0x1000, scope: "main", isPointer: true, pointsTo: 0x3000 }
      ],
      stack: [{ id: "main", functionName: "main", parameters: [], localVariables: [{ id: "ptr", name: "ptr", type: "int*", value: "0x3000 (Dangling)", address: 0x1000, scope: "main", isPointer: true, pointsTo: 0x3000 }] }],
      heap: [
        { id: "h1", address: 0x3000, size: 8, type: "int[2]", value: ["50", "100"], isFree: true }
      ],
      console: "Memory block at 0x3000 successfully freed.\n",
      highlights: { line: 9 },
      expressionSteps: ["free(0x3000)"],
      arrayData: [],
      quiz: {
        question: "What is a 'Dangling Pointer'?",
        options: [
          "A pointer pointing to a valid structure",
          "A pointer whose address has been freed/deallocated from the heap",
          "An uninitialized local pointer variable",
          "A pointer storing NULL"
        ],
        correctIndex: 1,
        explanation: "A dangling pointer is a pointer that still stores the memory address of a block that has already been deallocated using `free()`. Accessing it can cause undefined behavior.",
        type: "output"
      }
    });
  }

  // Fallback for default
  if (steps.length === 0) {
    steps.push({
      line: 1,
      explanation: "Initial state starting execution.",
      variables: [],
      stack: [{ id: "s", functionName: "main", parameters: [], localVariables: [] }],
      heap: [],
      console: "Execution started.\n",
      highlights: { line: 1 }
    });
  }

  return steps;
}
