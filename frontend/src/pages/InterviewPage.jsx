import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, 
  Play, 
  Square, 
  ChevronRight, 
  ChevronLeft,
  Star, 
  Code, 
  RefreshCw, 
  Trophy, 
  Eye,
  EyeOff,
  SkipForward,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Lightbulb,
  Check,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { API_ORIGIN } from '@/lib/apiConfig';

const LANGUAGES = {
  javascript: { name: 'JavaScript', template: '// Write your JavaScript solution here\nfunction solution() {\n  \n}' },
  typescript: { name: 'TypeScript', template: '// Write your TypeScript solution here\nfunction solution(): void {\n  \n}' },
  python: { name: 'Python', template: '# Write your Python solution here\ndef solution():\n    pass' },
  java: { name: 'Java', template: '// Write your Java solution here\npublic class Solution {\n    public void solution() {\n        \n    }\n}' },
  cpp: { name: 'C++', template: '// Write your C++ solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}' },
  c: { name: 'C', template: '// Write your C solution here\n#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}' },
  sql: { name: 'SQL', template: '-- Write your SQL query here\nSELECT \nFROM \nWHERE ;' },
};

const QUESTION_TEMPLATES = {
  easy: [
    {
      category: 'Arrays',
      title: 'Find Maximum Element',
      desc: 'Find the largest number in an array.',
      hint: 'Iterate through the array and keep track of the maximum value seen so far.',
      sampleInput: '[1, 5, 3, 9, 2]',
      sampleOutput: '9',
      constraints: ['1 <= array.length <= 10^5', '-10^9 <= array[i] <= 10^9'],
      time: 'O(n)',
      space: 'O(1)',
      solutions: {
        javascript: 'function findMax(arr) {\n  if (!arr || arr.length === 0) return 0;\n  let max = arr[0];\n  for (let i = 1; i < arr.length; i++) {\n    if (arr[i] > max) max = arr[i];\n  }\n  return max;\n}',
        typescript: 'function findMax(arr: number[]): number {\n  if (!arr || arr.length === 0) return 0;\n  let max = arr[0];\n  for (let i = 1; i < arr.length; i++) {\n    if (arr[i] > max) max = arr[i];\n  }\n  return max;\n}',
        python: 'def find_max(arr):\n    if not arr:\n        return 0\n    max_val = arr[0]\n    for val in arr:\n        if val > max_val:\n            max_val = val\n    return max_val',
        java: 'public static int findMax(int[] arr) {\n    if (arr == null || arr.length == 0) return 0;\n    int max = arr[0];\n    for (int i = 1; i < arr.length; i++) {\n        if (arr[i] > max) max = arr[i];\n    }\n    return max;\n}',
        cpp: 'int findMax(vector<int>& arr) {\n    if (arr.empty()) return 0;\n    int maxVal = arr[0];\n    for (int val : arr) {\n        if (val > maxVal) maxVal = val;\n    }\n    return maxVal;\n}'
      }
    },
    {
      category: 'Strings',
      title: 'Palindrome Check',
      desc: 'Determine if a given string reads the same backwards as forwards, ignoring spaces and casing.',
      hint: 'Use two pointers starting at the beginning and the end of the string, moving towards each other.',
      sampleInput: '"A man a plan a canal Panama"',
      sampleOutput: 'true',
      constraints: ['0 <= s.length <= 10^5', 's consists of printable ASCII characters'],
      time: 'O(n)',
      space: 'O(1)',
      solutions: {
        javascript: 'function isPalindrome(s) {\n  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, "");\n  let left = 0, right = cleaned.length - 1;\n  while (left < right) {\n    if (cleaned[left] !== cleaned[right]) return false;\n    left++;\n    right--;\n  }\n  return true;\n}',
        typescript: 'function isPalindrome(s: string): boolean {\n  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, "");\n  let left = 0, right = cleaned.length - 1;\n  while (left < right) {\n    if (cleaned[left] !== cleaned[right]) return false;\n    left++;\n    right--;\n  }\n  return true;\n}',
        python: 'def is_palindrome(s):\n    cleaned = "".join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]',
        java: 'public boolean isPalindrome(String s) {\n    String cleaned = s.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();\n    int left = 0, right = cleaned.length() - 1;\n    while (left < right) {\n        if (cleaned.charAt(left) != cleaned.charAt(right)) return false;\n        left++;\n        right--;\n    }\n    return true;\n}',
        cpp: 'bool isPalindrome(string s) {\n    string cleaned = "";\n    for (char c : s) {\n        if (isalnum(c)) cleaned += tolower(c);\n    }\n    int left = 0, right = cleaned.length() - 1;\n    while (left < right) {\n        if (cleaned[left] != cleaned[right]) return false;\n        left++;\n        right--;\n    }\n    return true;\n}'
      }
    }
  ],
  medium: [
    {
      category: 'Algorithms',
      title: 'Two Sum Problem',
      desc: 'Find two numbers in an array that add up to a target number and return their indices.',
      hint: 'Use a hash map to map each number to its index. Check if the complement (target - num) exists in the map.',
      sampleInput: 'nums = [2, 7, 11, 15], target = 9',
      sampleOutput: '[0, 1]',
      constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Exactly one solution exists'],
      time: 'O(n)',
      space: 'O(n)',
      solutions: {
        javascript: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}',
        typescript: 'function twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement)!, i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}',
        python: 'def two_sum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in lookup:\n            return [lookup[comp], i]\n        lookup[num] = i\n    return []',
        java: 'public int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int comp = target - nums[i];\n        if (map.containsKey(comp)) {\n            return new int[]{map.get(comp), i};\n        }\n        map.put(nums[i], i);\n    }\n    return new int[]{};\n}',
        cpp: 'vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> map;\n    for (int i = 0; i < nums.size(); i++) {\n        int comp = target - nums[i];\n        if (map.find(comp) != map.end()) {\n            return {map[comp], i};\n        }\n        map[nums[i]] = i;\n    }\n    return {};\n}'
      }
    },
    {
      category: 'Data Structures',
      title: 'Valid Parentheses',
      desc: 'Verify if input string containing brackets (, ), [, ], {, } is valid.',
      hint: 'Utilize a Stack to push opening brackets and pop/check when encountering closing ones.',
      sampleInput: '"()[]{}"',
      sampleOutput: 'true',
      constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only'],
      time: 'O(n)',
      space: 'O(n)',
      solutions: {
        javascript: 'function isValid(s) {\n  const stack = [];\n  const pairs = { ")": "(", "}": "{", "]": "[" };\n  for (let char of s) {\n    if (char === "(" || char === "{" || char === "[") {\n      stack.push(char);\n    } else {\n      if (stack.pop() !== pairs[char]) return false;\n    }\n  }\n  return stack.length === 0;\n}',
        typescript: 'function isValid(s: string): boolean {\n  const stack: string[] = [];\n  const pairs: Record<string, string> = { ")": "(", "}": "{", "]": "[" };\n  for (let char of s) {\n    if (char === "(" || char === "{" || char === "[") {\n      stack.push(char);\n    } else {\n      if (stack.pop() !== pairs[char]) return false;\n    }\n  }\n  return stack.length === 0;\n}',
        python: 'def is_valid(s):\n    stack = []\n    pairs = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in pairs.values():\n            stack.append(char)\n        elif char in pairs:\n            if not stack or stack.pop() != pairs[char]:\n                return False\n    return len(stack) == 0',
        java: 'public boolean isValid(String s) {\n    Stack<Character> stack = new Stack<>();\n    for (char c : s.toCharArray()) {\n        if (c == \'(\' || c == \'{\' || c == \'[\') stack.push(c);\n        else {\n            if (stack.isEmpty()) return false;\n            char top = stack.pop();\n            if (c == \')\' && top != \'(\') return false;\n            if (c == \'}\' && top != \'{\') return false;\n            if (c == \']\' && top != \'[\') return false;\n        }\n    }\n    return stack.isEmpty();\n}',
        cpp: 'bool isValid(string s) {\n    stack<char> st;\n    for (char c : s) {\n        if (c == \'(\' || c == \'{\' || c == \'[\') st.push(c);\n        else {\n            if (st.empty()) return false;\n            char top = st.top(); st.pop();\n            if (c == \')\' && top != \'(\') return false;\n            if (c == \'}\' && top != \'{\') return false;\n            if (c == \']\' && top != \'[\') return false;\n        }\n    }\n    return st.empty();\n}'
      }
    }
  ],
  hard: [
    {
      category: 'Advanced Algorithms',
      title: 'LRU Cache Design',
      desc: 'Design and implement a Least Recently Used (LRU) cache with O(1) get and put complexity.',
      hint: 'Combine a Doubly Linked List (for maintaining recency order) and a Hash Map (for O(1) lookups).',
      sampleInput: 'LRUCache cache = new LRUCache(2); cache.put(1, 1); cache.get(1);',
      sampleOutput: '1',
      constraints: ['1 <= capacity <= 3000', 'get and put must run in O(1) time'],
      time: 'O(1)',
      space: 'O(capacity)',
      solutions: {
        javascript: 'class Node {\n  constructor(key, val) {\n    this.key = key; this.val = val;\n    this.prev = null; this.next = null;\n  }\n}\n\nclass LRUCache {\n  constructor(capacity) {\n    this.cap = capacity;\n    this.map = new Map();\n    this.head = new Node(0, 0);\n    this.tail = new Node(0, 0);\n    this.head.next = this.tail;\n    this.tail.prev = this.head;\n  }\n\n  remove(node) {\n    node.prev.next = node.next;\n    node.next.prev = node.prev;\n  }\n\n  insert(node) {\n    node.next = this.head.next;\n    node.next.prev = node;\n    this.head.next = node;\n    node.prev = this.head;\n  }\n\n  get(key) {\n    if (this.map.has(key)) {\n      const node = this.map.get(key);\n      this.remove(node);\n      this.insert(node);\n      return node.val;\n    }\n    return -1;\n  }\n\n  put(key, value) {\n    if (this.map.has(key)) {\n      this.remove(this.map.get(key));\n    }\n    const node = new Node(key, value);\n    this.insert(node);\n    this.map.set(key, node);\n    if (this.map.size > this.cap) {\n      const lru = this.tail.prev;\n      this.remove(lru);\n      this.map.delete(lru.key);\n    }\n  }\n}',
        typescript: '// TS LRU Cache Solution',
        python: '# Python LRU Cache Solution\nimport collections\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.cap = capacity\n        self.cache = collections.OrderedDict()\n    def get(self, key: int) -> int:\n        if key not in self.cache:\n            return -1\n        self.cache.move_to_end(key)\n        return self.cache[key]\n    def put(self, key: int, value: int) -> None:\n        if key in self.cache:\n            self.cache.move_to_end(key)\n        self.cache[key] = value\n        if len(self.cache) > self.cap:\n            self.cache.popitem(last=False)',
        java: '// Java LRU Cache Solution',
        cpp: '// C++ LRU Cache Solution'
      }
    }
  ]
};

const DURATIONS = { 5: 300, 10: 600, 15: 900, 20: 1200, 30: 1800 };

// ── Company-specific question bank ───────────────────────────────────────────
const COMPANY_QUESTIONS = {
  google: {
    javascript: [
      { category: 'Algorithms', title: 'Longest Substring Without Repeating Characters', desc: 'Given a string, find the length of the longest substring without repeating characters. Google expects an O(n) sliding window solution.', hint: 'Use a sliding window with a Set to track characters. Expand right, shrink left when duplicate found.', time: 'O(n)', space: 'O(min(n,m))', expectedConcepts: ['sliding window', 'hash set', 'two pointers', 'string traversal'], solution: 'function lengthOfLongestSubstring(s) {\n  const set = new Set();\n  let left = 0, max = 0;\n  for (let right = 0; right < s.length; right++) {\n    while (set.has(s[right])) { set.delete(s[left++]); }\n    set.add(s[right]);\n    max = Math.max(max, right - left + 1);\n  }\n  return max;\n}' },
      { category: 'Dynamic Programming', title: 'Climbing Stairs', desc: 'You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?', hint: 'This is essentially Fibonacci. dp[i] = dp[i-1] + dp[i-2].', time: 'O(n)', space: 'O(1)', expectedConcepts: ['dynamic programming', 'fibonacci', 'memoization', 'bottom-up DP'], solution: 'function climbStairs(n) {\n  if (n <= 2) return n;\n  let a = 1, b = 2;\n  for (let i = 3; i <= n; i++) { [a, b] = [b, a + b]; }\n  return b;\n}' },
      { category: 'Trees', title: 'Binary Tree Level Order Traversal', desc: 'Given the root of a binary tree, return the level order traversal of its nodes\' values (i.e., from left to right, level by level).', hint: 'Use a queue (BFS). Process all nodes at current level before moving to next.', time: 'O(n)', space: 'O(n)', expectedConcepts: ['BFS', 'queue', 'tree traversal', 'level order'], solution: 'function levelOrder(root) {\n  if (!root) return [];\n  const result = [], queue = [root];\n  while (queue.length) {\n    const level = [], size = queue.length;\n    for (let i = 0; i < size; i++) {\n      const node = queue.shift();\n      level.push(node.val);\n      if (node.left) queue.push(node.left);\n      if (node.right) queue.push(node.right);\n    }\n    result.push(level);\n  }\n  return result;\n}' },
    ],
    python: [
      { category: 'Graphs', title: 'Number of Islands', desc: 'Given an m x n 2D binary grid representing a map of land (1) and water (0), return the number of islands. Google frequently asks graph traversal problems.', hint: 'DFS/BFS from each unvisited land cell, marking visited cells to avoid re-counting.', time: 'O(m*n)', space: 'O(m*n)', expectedConcepts: ['DFS', 'BFS', 'graph traversal', 'matrix', 'flood fill'], solution: 'def numIslands(grid):\n    if not grid: return 0\n    count = 0\n    def dfs(r, c):\n        if r < 0 or r >= len(grid) or c < 0 or c >= len(grid[0]) or grid[r][c] != "1": return\n        grid[r][c] = "0"\n        for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]: dfs(r+dr, c+dc)\n    for r in range(len(grid)):\n        for c in range(len(grid[0])):\n            if grid[r][c] == "1": count += 1; dfs(r, c)\n    return count' },
      { category: 'Dynamic Programming', title: 'Coin Change', desc: 'Given coins of different denominations and a total amount, find the fewest number of coins needed to make up that amount. Return -1 if not possible.', hint: 'Bottom-up DP. dp[i] = min coins to make amount i. Initialize dp[0]=0, rest=infinity.', time: 'O(amount * coins)', space: 'O(amount)', expectedConcepts: ['dynamic programming', 'bottom-up DP', 'unbounded knapsack', 'infinity initialization'], solution: 'def coinChange(coins, amount):\n    dp = [float("inf")] * (amount + 1)\n    dp[0] = 0\n    for i in range(1, amount + 1):\n        for c in coins:\n            if c <= i: dp[i] = min(dp[i], dp[i-c] + 1)\n    return dp[amount] if dp[amount] != float("inf") else -1' },
    ],
  },
  amazon: {
    javascript: [
      { category: 'Arrays', title: 'Product of Array Except Self', desc: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all elements except nums[i]. Must run in O(n) without division.', hint: 'Two passes: left products then right products. No extra space needed beyond output array.', time: 'O(n)', space: 'O(1)', expectedConcepts: ['prefix product', 'suffix product', 'two-pass', 'in-place'], solution: 'function productExceptSelf(nums) {\n  const n = nums.length, res = new Array(n).fill(1);\n  let left = 1;\n  for (let i = 0; i < n; i++) { res[i] = left; left *= nums[i]; }\n  let right = 1;\n  for (let i = n-1; i >= 0; i--) { res[i] *= right; right *= nums[i]; }\n  return res;\n}' },
      { category: 'Linked Lists', title: 'Merge Two Sorted Lists', desc: 'Merge two sorted linked lists and return it as a sorted list. Amazon tests this in phone screens frequently.', hint: 'Use a dummy head node. Compare heads of both lists, attach smaller one, advance that pointer.', time: 'O(n+m)', space: 'O(1)', expectedConcepts: ['linked list', 'dummy node', 'two pointers', 'merge'], solution: 'function mergeTwoLists(l1, l2) {\n  const dummy = { next: null };\n  let cur = dummy;\n  while (l1 && l2) {\n    if (l1.val <= l2.val) { cur.next = l1; l1 = l1.next; }\n    else { cur.next = l2; l2 = l2.next; }\n    cur = cur.next;\n  }\n  cur.next = l1 || l2;\n  return dummy.next;\n}' },
      { category: 'System Design', title: 'Design a Rate Limiter', desc: 'Design a rate limiter that allows at most N requests per second per user. Implement using a sliding window or token bucket approach in JavaScript.', hint: 'Use a Map to store timestamps per user. Sliding window: keep only timestamps within last second.', time: 'O(1) amortized', space: 'O(users)', expectedConcepts: ['sliding window', 'token bucket', 'rate limiting', 'system design', 'Map'], solution: 'class RateLimiter {\n  constructor(limit) { this.limit = limit; this.requests = new Map(); }\n  isAllowed(userId) {\n    const now = Date.now();\n    const window = 1000;\n    if (!this.requests.has(userId)) this.requests.set(userId, []);\n    const times = this.requests.get(userId).filter(t => now - t < window);\n    if (times.length >= this.limit) return false;\n    times.push(now);\n    this.requests.set(userId, times);\n    return true;\n  }\n}' },
    ],
    python: [
      { category: 'Trees', title: 'Lowest Common Ancestor of BST', desc: 'Given a BST and two nodes p and q, find their lowest common ancestor. Amazon asks this in almost every tree round.', hint: 'In a BST, if both p and q are less than root, go left. If both greater, go right. Otherwise root is LCA.', time: 'O(h)', space: 'O(1)', expectedConcepts: ['BST property', 'LCA', 'tree traversal', 'recursion vs iteration'], solution: 'def lowestCommonAncestor(root, p, q):\n    while root:\n        if p.val < root.val and q.val < root.val: root = root.left\n        elif p.val > root.val and q.val > root.val: root = root.right\n        else: return root' },
    ],
  },
  microsoft: {
    javascript: [
      { category: 'Strings', title: 'Reverse Words in a String', desc: 'Given an input string s, reverse the order of the words. Words are separated by spaces. Microsoft tests string manipulation heavily.', hint: 'Split by spaces, filter empty strings, reverse array, join with single space.', time: 'O(n)', space: 'O(n)', expectedConcepts: ['string split', 'array reverse', 'trim', 'regex'], solution: 'function reverseWords(s) {\n  return s.trim().split(/\\s+/).reverse().join(" ");\n}' },
      { category: 'Dynamic Programming', title: 'Maximum Subarray (Kadane\'s)', desc: 'Find the contiguous subarray with the largest sum. This is a classic Microsoft interview question testing DP fundamentals.', hint: 'Kadane\'s algorithm: track current sum and global max. Reset current sum to 0 if it goes negative.', time: 'O(n)', space: 'O(1)', expectedConcepts: ['Kadane\'s algorithm', 'dynamic programming', 'greedy', 'subarray'], solution: 'function maxSubArray(nums) {\n  let cur = nums[0], max = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    cur = Math.max(nums[i], cur + nums[i]);\n    max = Math.max(max, cur);\n  }\n  return max;\n}' },
    ],
    java: [
      { category: 'OOP Design', title: 'Design a Parking Lot', desc: 'Design a parking lot system with multiple floors, different vehicle types (car, bike, truck), and parking spot allocation. Microsoft OOP design round classic.', hint: 'Classes: ParkingLot, Floor, Spot, Vehicle. Use enums for VehicleType and SpotType. Strategy pattern for allocation.', time: 'O(floors * spots)', space: 'O(floors * spots)', expectedConcepts: ['OOP design', 'enums', 'strategy pattern', 'encapsulation', 'class hierarchy'], solution: '// ParkingLot OOP Design\nenum VehicleType { CAR, BIKE, TRUCK }\nclass Spot { int id; boolean occupied; VehicleType type; }\nclass Floor { List<Spot> spots; }\nclass ParkingLot {\n  List<Floor> floors;\n  Spot findSpot(VehicleType type) {\n    for (Floor f : floors)\n      for (Spot s : f.spots)\n        if (!s.occupied && s.type == type) return s;\n    return null;\n  }\n}' },
    ],
  },
  meta: {
    javascript: [
      { category: 'Arrays', title: 'Move Zeroes', desc: 'Given an integer array nums, move all 0s to the end while maintaining the relative order of non-zero elements. Do it in-place.', hint: 'Two pointers: one for position to place next non-zero, one iterating. Swap when non-zero found.', time: 'O(n)', space: 'O(1)', expectedConcepts: ['two pointers', 'in-place', 'swap', 'partition'], solution: 'function moveZeroes(nums) {\n  let pos = 0;\n  for (let i = 0; i < nums.length; i++) {\n    if (nums[i] !== 0) { [nums[pos], nums[i]] = [nums[i], nums[pos]]; pos++; }\n  }\n}' },
      { category: 'Graphs', title: 'Clone Graph', desc: 'Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Meta tests graph cloning in system design contexts.', hint: 'DFS/BFS with a HashMap mapping original nodes to cloned nodes to handle cycles.', time: 'O(V+E)', space: 'O(V)', expectedConcepts: ['DFS', 'hash map', 'deep copy', 'cycle handling', 'graph traversal'], solution: 'function cloneGraph(node) {\n  if (!node) return null;\n  const map = new Map();\n  function dfs(n) {\n    if (map.has(n)) return map.get(n);\n    const clone = { val: n.val, neighbors: [] };\n    map.set(n, clone);\n    for (const nb of n.neighbors) clone.neighbors.push(dfs(nb));\n    return clone;\n  }\n  return dfs(node);\n}' },
    ],
  },
  tcs: {
    javascript: [
      { category: 'Basics', title: 'FizzBuzz', desc: 'Print numbers 1 to n. For multiples of 3 print "Fizz", for multiples of 5 print "Buzz", for multiples of both print "FizzBuzz". Classic TCS screening question.', hint: 'Check divisibility by 15 first, then 3, then 5, else the number itself.', time: 'O(n)', space: 'O(1)', expectedConcepts: ['modulo operator', 'conditional logic', 'loop', 'order of checks'], solution: 'function fizzBuzz(n) {\n  const res = [];\n  for (let i = 1; i <= n; i++) {\n    if (i % 15 === 0) res.push("FizzBuzz");\n    else if (i % 3 === 0) res.push("Fizz");\n    else if (i % 5 === 0) res.push("Buzz");\n    else res.push(String(i));\n  }\n  return res;\n}' },
      { category: 'Arrays', title: 'Find Duplicate in Array', desc: 'Given an array of n+1 integers where each integer is between 1 and n, find the duplicate number. TCS tests array fundamentals.', hint: 'Use Floyd\'s cycle detection or XOR trick. Or sort and check adjacent elements.', time: 'O(n)', space: 'O(1)', expectedConcepts: ['Floyd\'s cycle detection', 'XOR', 'pigeonhole principle', 'in-place'], solution: 'function findDuplicate(nums) {\n  let slow = nums[0], fast = nums[0];\n  do { slow = nums[slow]; fast = nums[nums[fast]]; } while (slow !== fast);\n  slow = nums[0];\n  while (slow !== fast) { slow = nums[slow]; fast = nums[fast]; }\n  return slow;\n}' },
    ],
    java: [
      { category: 'OOP', title: 'Implement a Stack using Arrays', desc: 'Implement a Stack data structure using arrays with push, pop, peek, and isEmpty operations. TCS Java round fundamental.', hint: 'Use an array with a top pointer. Increment on push, decrement on pop. Check bounds.', time: 'O(1)', space: 'O(n)', expectedConcepts: ['stack ADT', 'array-backed DS', 'LIFO', 'bounds checking'], solution: 'class Stack {\n  int[] arr; int top = -1;\n  Stack(int size) { arr = new int[size]; }\n  void push(int x) { arr[++top] = x; }\n  int pop() { return arr[top--]; }\n  int peek() { return arr[top]; }\n  boolean isEmpty() { return top == -1; }\n}' },
    ],
    python: [
      { category: 'Strings', title: 'Count Vowels and Consonants', desc: 'Given a string, count the number of vowels and consonants. Ignore spaces and special characters. TCS Python screening question.', hint: 'Iterate through string, check if each char is alpha, then check if it\'s in vowel set.', time: 'O(n)', space: 'O(1)', expectedConcepts: ['string iteration', 'set lookup', 'isalpha', 'character classification'], solution: 'def count_vowels_consonants(s):\n    vowels = set("aeiouAEIOU")\n    v = c = 0\n    for ch in s:\n        if ch.isalpha():\n            if ch in vowels: v += 1\n            else: c += 1\n    return v, c' },
    ],
  },
  infosys: {
    javascript: [
      { category: 'Arrays', title: 'Rotate Array', desc: 'Given an array, rotate it to the right by k steps. Infosys tests array manipulation in their coding rounds.', hint: 'Reverse entire array, then reverse first k elements, then reverse remaining. All in-place.', time: 'O(n)', space: 'O(1)', expectedConcepts: ['array rotation', 'reverse trick', 'modulo', 'in-place'], solution: 'function rotate(nums, k) {\n  k %= nums.length;\n  const rev = (l, r) => { while (l < r) { [nums[l], nums[r]] = [nums[r], nums[l]]; l++; r--; } };\n  rev(0, nums.length-1); rev(0, k-1); rev(k, nums.length-1);\n}' },
      { category: 'Strings', title: 'Anagram Check', desc: 'Given two strings s and t, return true if t is an anagram of s. Infosys string manipulation classic.', hint: 'Sort both strings and compare, or use a frequency map.', time: 'O(n log n)', space: 'O(1)', expectedConcepts: ['anagram', 'sorting', 'frequency map', 'character count'], solution: 'function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  return s.split("").sort().join("") === t.split("").sort().join("");\n}' },
    ],
    python: [
      { category: 'Patterns', title: 'Print Diamond Pattern', desc: 'Print a diamond pattern of stars for a given number of rows n. Infosys pattern printing is a common screening question.', hint: 'Upper half: spaces decrease, stars increase. Lower half: reverse. Use string multiplication.', time: 'O(n²)', space: 'O(1)', expectedConcepts: ['nested loops', 'string multiplication', 'pattern logic', 'odd number sequence'], solution: 'def diamond(n):\n    for i in range(1, n+1, 2):\n        print(" " * ((n-i)//2) + "*" * i)\n    for i in range(n-2, 0, -2):\n        print(" " * ((n-i)//2) + "*" * i)' },
    ],
  },
  wipro: {
    javascript: [
      { category: 'Recursion', title: 'Fibonacci Sequence', desc: 'Write a function to return the nth Fibonacci number. Wipro tests recursion and memoization fundamentals.', hint: 'Naive recursion is O(2^n). Use memoization or iterative approach for O(n).', time: 'O(n)', space: 'O(n)', expectedConcepts: ['recursion', 'memoization', 'top-down DP', 'base case'], solution: 'function fib(n, memo = {}) {\n  if (n <= 1) return n;\n  if (memo[n]) return memo[n];\n  return memo[n] = fib(n-1, memo) + fib(n-2, memo);\n}' },
      { category: 'Arrays', title: 'Second Largest Element', desc: 'Find the second largest element in an array without sorting. Wipro frequently asks this in their aptitude + coding round.', hint: 'Single pass: track largest and second largest. Update both when new max found.', time: 'O(n)', space: 'O(1)', expectedConcepts: ['single pass', 'two variables', 'comparison logic', 'edge cases'], solution: 'function secondLargest(arr) {\n  let first = -Infinity, second = -Infinity;\n  for (const n of arr) {\n    if (n > first) { second = first; first = n; }\n    else if (n > second && n !== first) second = n;\n  }\n  return second;\n}' },
    ],
  },
  startup: {
    javascript: [
      { category: 'Full Stack', title: 'Debounce Function', desc: 'Implement a debounce function that delays invoking func until after wait milliseconds have elapsed since the last time it was invoked. Common in startup frontend interviews.', hint: 'Use setTimeout and clearTimeout. Return a wrapper function that resets the timer on each call.', time: 'O(1)', space: 'O(1)', expectedConcepts: ['closure', 'setTimeout', 'clearTimeout', 'higher-order function'], solution: 'function debounce(fn, wait) {\n  let timer;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), wait);\n  };\n}' },
      { category: 'Async', title: 'Promise.all Implementation', desc: 'Implement your own version of Promise.all that takes an array of promises and resolves when all resolve, or rejects if any reject.', hint: 'Track count of resolved promises. Resolve when count equals input length. Reject immediately on any failure.', time: 'O(n)', space: 'O(n)', expectedConcepts: ['Promise', 'async/await', 'counter pattern', 'early rejection'], solution: 'function promiseAll(promises) {\n  return new Promise((resolve, reject) => {\n    const results = [];\n    let count = 0;\n    if (!promises.length) return resolve([]);\n    promises.forEach((p, i) => {\n      Promise.resolve(p).then(val => {\n        results[i] = val;\n        if (++count === promises.length) resolve(results);\n      }).catch(reject);\n    });\n  });\n}' },
    ],
    python: [
      { category: 'API Design', title: 'Flatten Nested Dictionary', desc: 'Given a nested dictionary, flatten it so all keys are at the top level with dot notation. Common in startup Python backend interviews.', hint: 'Recursive DFS. For each key, if value is dict recurse with prefix. Otherwise add to result.', time: 'O(n)', space: 'O(n)', expectedConcepts: ['recursion', 'DFS', 'dictionary traversal', 'dot notation', 'base case'], solution: 'def flatten(d, prefix="", result=None):\n    if result is None: result = {}\n    for k, v in d.items():\n        key = f"{prefix}.{k}" if prefix else k\n        if isinstance(v, dict): flatten(v, key, result)\n        else: result[key] = v\n    return result' },
    ],
  },
  netflix: {
    javascript: [
      { category: 'System Design', title: 'Implement a Video Streaming Buffer', desc: 'Design a circular buffer for video streaming that supports enqueue (add chunk) and dequeue (consume chunk) operations. Netflix uses ring buffers for adaptive bitrate streaming.', hint: 'Use a fixed-size array with head/tail pointers. Wrap around using modulo. Track size separately.', time: 'O(1)', space: 'O(capacity)', expectedConcepts: ['circular buffer', 'ring buffer', 'modulo arithmetic', 'queue ADT'], solution: 'class StreamBuffer {\n  constructor(cap) { this.buf = new Array(cap); this.head = 0; this.tail = 0; this.size = 0; this.cap = cap; }\n  enqueue(chunk) {\n    if (this.size === this.cap) throw new Error("Buffer full");\n    this.buf[this.tail] = chunk;\n    this.tail = (this.tail + 1) % this.cap;\n    this.size++;\n  }\n  dequeue() {\n    if (this.size === 0) throw new Error("Buffer empty");\n    const chunk = this.buf[this.head];\n    this.head = (this.head + 1) % this.cap;\n    this.size--;\n    return chunk;\n  }\n}' },
      { category: 'Algorithms', title: 'Top K Frequent Elements', desc: 'Given an integer array nums and an integer k, return the k most frequent elements. Netflix uses this for recommendation ranking.', hint: 'Use a frequency map then a min-heap of size k, or bucket sort by frequency for O(n).', time: 'O(n)', space: 'O(n)', expectedConcepts: ['hash map', 'bucket sort', 'heap', 'frequency counting'], solution: 'function topKFrequent(nums, k) {\n  const freq = new Map();\n  for (const n of nums) freq.set(n, (freq.get(n) || 0) + 1);\n  const buckets = Array.from({ length: nums.length + 1 }, () => []);\n  for (const [num, cnt] of freq) buckets[cnt].push(num);\n  const res = [];\n  for (let i = buckets.length - 1; i >= 0 && res.length < k; i--) res.push(...buckets[i]);\n  return res.slice(0, k);\n}' },
      { category: 'Strings', title: 'Group Anagrams', desc: 'Given an array of strings, group the anagrams together. Netflix content tagging systems use anagram grouping for deduplication.', hint: 'Sort each string as a key. Group strings with the same sorted key into a map.', time: 'O(n * k log k)', space: 'O(n)', expectedConcepts: ['hash map', 'sorting', 'string manipulation', 'grouping'], solution: 'function groupAnagrams(strs) {\n  const map = new Map();\n  for (const s of strs) {\n    const key = s.split("").sort().join("");\n    if (!map.has(key)) map.set(key, []);\n    map.get(key).push(s);\n  }\n  return [...map.values()];\n}' },
    ],
    python: [
      { category: 'Dynamic Programming', title: 'Longest Increasing Subsequence', desc: 'Given an integer array nums, return the length of the longest strictly increasing subsequence. Netflix uses LIS in content sequencing algorithms.', hint: 'DP: dp[i] = max length ending at i. Or use patience sorting with binary search for O(n log n).', time: 'O(n log n)', space: 'O(n)', expectedConcepts: ['dynamic programming', 'binary search', 'patience sorting', 'subsequence'], solution: 'import bisect\ndef lengthOfLIS(nums):\n    tails = []\n    for n in nums:\n        pos = bisect.bisect_left(tails, n)\n        if pos == len(tails): tails.append(n)\n        else: tails[pos] = n\n    return len(tails)' },
    ],
    sql: [
      { category: 'SQL', title: 'Top Watched Content Per Region', desc: 'Given a table watch_events(user_id, content_id, region, watch_time), write a query to find the top 3 most-watched content_ids per region by total watch_time. Netflix analytics classic.', hint: 'Use ROW_NUMBER() or RANK() with PARTITION BY region ORDER BY total_watch_time DESC. Wrap in a CTE.', time: 'O(n log n)', space: 'O(n)', expectedConcepts: ['window functions', 'ROW_NUMBER', 'PARTITION BY', 'CTE', 'aggregation'], solution: 'WITH ranked AS (\n  SELECT region, content_id,\n         SUM(watch_time) AS total_watch,\n         ROW_NUMBER() OVER (PARTITION BY region ORDER BY SUM(watch_time) DESC) AS rn\n  FROM watch_events\n  GROUP BY region, content_id\n)\nSELECT region, content_id, total_watch\nFROM ranked WHERE rn <= 3;' },
    ],
  },
  apple: {
    javascript: [
      { category: 'Trees', title: 'Diameter of Binary Tree', desc: 'Given the root of a binary tree, return the length of the diameter (longest path between any two nodes). Apple asks this in iOS SDK interviews for tree traversal.', hint: 'DFS: at each node, diameter through it = left_depth + right_depth. Track global max.', time: 'O(n)', space: 'O(h)', expectedConcepts: ['DFS', 'recursion', 'tree depth', 'post-order traversal'], solution: 'function diameterOfBinaryTree(root) {\n  let max = 0;\n  function depth(node) {\n    if (!node) return 0;\n    const l = depth(node.left), r = depth(node.right);\n    max = Math.max(max, l + r);\n    return 1 + Math.max(l, r);\n  }\n  depth(root);\n  return max;\n}' },
      { category: 'Arrays', title: 'Merge Intervals', desc: 'Given an array of intervals, merge all overlapping intervals and return the result. Apple uses this in calendar and scheduling APIs.', hint: 'Sort by start time. Iterate and merge if current start <= last end. Update end to max of both ends.', time: 'O(n log n)', space: 'O(n)', expectedConcepts: ['sorting', 'interval merging', 'greedy', 'two pointers'], solution: 'function merge(intervals) {\n  intervals.sort((a, b) => a[0] - b[0]);\n  const res = [intervals[0]];\n  for (let i = 1; i < intervals.length; i++) {\n    const last = res[res.length - 1];\n    if (intervals[i][0] <= last[1]) last[1] = Math.max(last[1], intervals[i][1]);\n    else res.push(intervals[i]);\n  }\n  return res;\n}' },
    ],
    swift: [
      { category: 'Swift / iOS', title: 'Implement a Generic Stack in Swift', desc: 'Implement a generic Stack<T> in Swift with push, pop, peek, and isEmpty. Apple expects idiomatic Swift with value semantics.', hint: 'Use a struct with a private Array<T>. Mutating functions for push/pop. Optional return for pop/peek.', time: 'O(1)', space: 'O(n)', expectedConcepts: ['generics', 'struct vs class', 'value semantics', 'mutating', 'optional'], solution: 'struct Stack<T> {\n  private var elements: [T] = []\n  var isEmpty: Bool { elements.isEmpty }\n  mutating func push(_ val: T) { elements.append(val) }\n  mutating func pop() -> T? { elements.popLast() }\n  func peek() -> T? { elements.last }\n}' },
    ],
    python: [
      { category: 'Graphs', title: 'Course Schedule (Cycle Detection)', desc: 'There are n courses. Given prerequisites pairs, determine if you can finish all courses. Apple uses topological sort in build system dependency checks.', hint: 'Model as directed graph. Use DFS with 3-color marking (unvisited/visiting/visited) to detect cycles.', time: 'O(V+E)', space: 'O(V+E)', expectedConcepts: ['topological sort', 'cycle detection', 'DFS', 'directed graph', 'Kahn\'s algorithm'], solution: 'def canFinish(n, prerequisites):\n    graph = [[] for _ in range(n)]\n    for a, b in prerequisites: graph[b].append(a)\n    state = [0] * n\n    def dfs(u):\n        if state[u] == 1: return False\n        if state[u] == 2: return True\n        state[u] = 1\n        if not all(dfs(v) for v in graph[u]): return False\n        state[u] = 2\n        return True\n    return all(dfs(i) for i in range(n))' },
    ],
  },
  generic: {
    javascript: [
      { category: 'Arrays', title: 'Two Sum', desc: 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target. Exactly one solution exists.', hint: 'Use a hash map. For each number, check if its complement (target - num) exists in the map.', time: 'O(n)', space: 'O(n)', expectedConcepts: ['hash map', 'complement lookup', 'single pass'], solution: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n}' },
      { category: 'Strings', title: 'Valid Palindrome', desc: 'A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward.', hint: 'Clean the string first, then use two pointers from both ends.', time: 'O(n)', space: 'O(n)', expectedConcepts: ['two pointers', 'string cleaning', 'palindrome'], solution: 'function isPalindrome(s) {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return clean === clean.split("").reverse().join("");\n}' },
    ],
    python: [
      { category: 'Algorithms', title: 'Binary Search', desc: 'Implement binary search on a sorted array. Return the index of target, or -1 if not found.', hint: 'Maintain left and right pointers. Check mid each iteration. Adjust bounds based on comparison.', time: 'O(log n)', space: 'O(1)', expectedConcepts: ['binary search', 'divide and conquer', 'sorted array'], solution: 'def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: left = mid + 1\n        else: right = mid - 1\n    return -1' },
    ],
    java: [
      { category: 'OOP', title: 'Singleton Pattern', desc: 'Implement the Singleton design pattern in Java. Ensure only one instance is created even in a multithreaded environment.', hint: 'Use double-checked locking with volatile keyword for thread safety.', time: 'O(1)', space: 'O(1)', expectedConcepts: ['singleton', 'double-checked locking', 'volatile', 'thread safety'], solution: 'class Singleton {\n  private static volatile Singleton instance;\n  private Singleton() {}\n  public static Singleton getInstance() {\n    if (instance == null) {\n      synchronized (Singleton.class) {\n        if (instance == null) instance = new Singleton();\n      }\n    }\n    return instance;\n  }\n}' },
    ],
    c: [
      { category: 'Pointers', title: 'Reverse a String In-Place', desc: 'Write a C function to reverse a null-terminated string in-place using pointer arithmetic. No extra buffer allowed.', hint: 'Use two pointers: one at start, one at end (before null terminator). Swap and move inward.', time: 'O(n)', space: 'O(1)', expectedConcepts: ['pointer arithmetic', 'in-place swap', 'null terminator', 'char array'], solution: 'void reverseStr(char *s) {\n  char *end = s;\n  while (*end) end++;\n  end--;\n  while (s < end) {\n    char tmp = *s; *s = *end; *end = tmp;\n    s++; end--;\n  }\n}' },
      { category: 'Memory', title: 'Implement malloc-like Memory Pool', desc: 'Implement a simple fixed-size memory pool allocator in C that pre-allocates a large buffer and hands out fixed-size blocks. Common in embedded/systems interviews.', hint: 'Use a static array as the pool. Track a free list of block indices. alloc pops from free list, free pushes back.', time: 'O(1)', space: 'O(pool_size)', expectedConcepts: ['memory management', 'free list', 'static allocation', 'pool allocator'], solution: '#define BLOCK 64\n#define N 16\nstatic char pool[N * BLOCK];\nstatic int free_list[N];\nstatic int free_top = 0;\nvoid pool_init() { for (int i = 0; i < N; i++) free_list[free_top++] = i; }\nvoid* pool_alloc() { if (!free_top) return NULL; return pool + free_list[--free_top] * BLOCK; }\nvoid pool_free(void *p) { free_list[free_top++] = ((char*)p - pool) / BLOCK; }' },
    ],
    sql: [
      { category: 'SQL', title: 'Find Employees Earning More Than Their Manager', desc: 'Given a table Employee(id, name, salary, managerId), write a SQL query to find all employees who earn more than their direct manager.', hint: 'Self-join the Employee table: join Employee e1 with Employee e2 on e1.managerId = e2.id, then filter e1.salary > e2.salary.', time: 'O(n²)', space: 'O(n)', expectedConcepts: ['self join', 'table alias', 'WHERE filter', 'relational algebra'], solution: 'SELECT e1.name AS Employee\nFROM Employee e1\nJOIN Employee e2 ON e1.managerId = e2.id\nWHERE e1.salary > e2.salary;' },
      { category: 'SQL', title: 'Second Highest Salary', desc: 'Write a SQL query to find the second highest distinct salary from the Employee table. Return NULL if it does not exist.', hint: 'Use a subquery with MAX() excluding the overall max, or use LIMIT/OFFSET with DISTINCT. Wrap in a SELECT to return NULL.', time: 'O(n)', space: 'O(1)', expectedConcepts: ['subquery', 'MAX', 'DISTINCT', 'NULL handling', 'LIMIT OFFSET'], solution: 'SELECT MAX(salary) AS SecondHighestSalary\nFROM Employee\nWHERE salary < (SELECT MAX(salary) FROM Employee);' },
    ],
    typescript: [
      { category: 'TypeScript', title: 'Generic Linked List', desc: 'Implement a generic singly linked list in TypeScript with append, prepend, delete, and toArray methods. Tests TypeScript generics and OOP.', hint: 'Define a Node<T> class and LinkedList<T> class. Use a head pointer. toArray traverses and collects values.', time: 'O(n)', space: 'O(n)', expectedConcepts: ['generics', 'linked list', 'OOP', 'type safety', 'null handling'], solution: 'class Node<T> { constructor(public val: T, public next: Node<T> | null = null) {} }\nclass LinkedList<T> {\n  private head: Node<T> | null = null;\n  append(val: T) { const n = new Node(val); if (!this.head) { this.head = n; return; } let c = this.head; while (c.next) c = c.next; c.next = n; }\n  prepend(val: T) { this.head = new Node(val, this.head); }\n  delete(val: T) { if (!this.head) return; if (this.head.val === val) { this.head = this.head.next; return; } let c = this.head; while (c.next && c.next.val !== val) c = c.next; if (c.next) c.next = c.next.next; }\n  toArray(): T[] { const r: T[] = []; let c = this.head; while (c) { r.push(c.val); c = c.next; } return r; }\n}' },
    ],
  },
};

const COMPANIES = [
  { value: 'generic',   label: '🌐 Generic',   emoji: '🌐' },
  { value: 'google',    label: '🔵 Google',    emoji: '🔵' },
  { value: 'amazon',    label: '🟠 Amazon',    emoji: '🟠' },
  { value: 'microsoft', label: '🟦 Microsoft', emoji: '🟦' },
  { value: 'meta',      label: '🔷 Meta',      emoji: '🔷' },
  { value: 'netflix',   label: '🔴 Netflix',   emoji: '🔴' },
  { value: 'apple',     label: '🍎 Apple',     emoji: '🍎' },
  { value: 'tcs',       label: '🇮🇳 TCS',       emoji: '🇮🇳' },
  { value: 'infosys',   label: '🟣 Infosys',   emoji: '🟣' },
  { value: 'wipro',     label: '🟤 Wipro',     emoji: '🟤' },
  { value: 'startup',   label: '🚀 Startup',   emoji: '🚀' },
];

// Pick questions for a company+language combo, shuffled, no repeats within session
const getCompanyQuestions = (company, lang, count) => {
  const bank = COMPANY_QUESTIONS?.[company]?.[lang]
    || COMPANY_QUESTIONS?.[company]?.javascript
    || COMPANY_QUESTIONS?.generic?.[lang]
    || COMPANY_QUESTIONS?.generic?.javascript
    || [];
  // Shuffle
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  // Pad with generic if not enough
  if (shuffled.length < count) {
    const generic = COMPANY_QUESTIONS?.generic?.[lang] || COMPANY_QUESTIONS?.generic?.javascript || [];
    const extra = [...generic].sort(() => Math.random() - 0.5);
    shuffled.push(...extra);
  }
  return shuffled.slice(0, count).map((q, i) => ({
    id:               i,
    company,
    language:         lang,
    title:            q.title,
    description:      q.desc,
    hint:             q.hint,
    category:         q.category,
    difficulty:       'medium',
    sampleSolution:   q.solution || '// No solution available',
    starterCode:      LANGUAGES?.[lang]?.template || '// Write your solution here',
    expectedConcepts: q.expectedConcepts || [],
    time:             q.time  || 'N/A',
    space:            q.space || 'N/A',
  }));
};

const InterviewPage = () => {
  // Config state
  const [language, setLanguage] = useState('javascript');
  const [difficulty, setDifficulty] = useState('medium');
  const [company, setCompany]   = useState('generic');
  const [evaluationMode, setEvaluationMode] = useState('interviewer');
  const [duration, setDuration] = useState(15);
  const [totalQuestions, setTotalQuestions] = useState(5);

  // Active Session State
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Per-question state arrays (indexed by question index)
  const [userCodes, setUserCodes] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [scores, setScores] = useState({});
  const [revealedAnswers, setRevealedAnswers] = useState({});
  // submittedQuestions: tracks which question indices have been submitted
  // locks editor + submit btn, unlocks Next navigation
  const [submittedQuestions, setSubmittedQuestions] = useState({});

  // Live session stats — correct = score>=70, wrong = score<70
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });

  // Celebration overlay — shown briefly on correct answer
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  // Wrong answer overlay
  const [wrongVisible, setWrongVisible] = useState(false);
  // Micro-animation type: 'correct' | 'wrong' | null
  const [microAnim, setMicroAnim] = useState(null);

  // Session timer
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  // Loading/Evaluating States
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  // Local Storage Session recovery
  useEffect(() => {
    try {
      const saved = localStorage.getItem('devinspect-interview-session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.running) {
          setLanguage(parsed?.language || 'javascript');
          setDifficulty(parsed?.difficulty || 'medium');
          setEvaluationMode(parsed?.evaluationMode || 'interviewer');
          setDuration(parsed?.duration || 15);
          setTotalQuestions(parsed?.totalQuestions || 5);
          setQuestions(Array.isArray(parsed?.questions) ? parsed.questions : []);
          setCurrentQuestionIndex(parsed?.currentQuestionIndex || 0);
          setUserCodes(typeof parsed?.userCodes === 'object' ? parsed.userCodes : {});
          setEvaluations(typeof parsed?.evaluations === 'object' ? parsed.evaluations : {});
          setScores(typeof parsed?.scores === 'object' ? parsed.scores : {});
          setRevealedAnswers(typeof parsed?.revealedAnswers === 'object' ? parsed.revealedAnswers : {});
          setSubmittedQuestions(typeof parsed?.submittedQuestions === 'object' ? parsed.submittedQuestions : {});
          setSessionStats(typeof parsed?.sessionStats === 'object' ? parsed.sessionStats : { correct: 0, wrong: 0 });
          setTimeLeft(parsed?.timeLeft || 0);
          setRunning(true);
        }
      }
    } catch (e) {
      console.warn("Could not restore session from storage", e);
    }
  }, []);

  // Use a ref to hold latest state for storage — avoids infinite re-render from deps
  const sessionStateRef = useRef({});
  useEffect(() => {
    sessionStateRef.current = {
      running, language, difficulty, evaluationMode, duration, totalQuestions,
      questions, currentQuestionIndex, userCodes, evaluations, scores,
      revealedAnswers, submittedQuestions, sessionStats, timeLeft
    };
  });

  // Sync state to localStorage for persistence
  const saveSessionToStorage = useCallback((updatedState = {}) => {
    try {
      const base = sessionStateRef.current;
      const stateToSave = { ...base, ...updatedState };
      if (stateToSave.running && !stateToSave.finished) {
        localStorage.setItem('devinspect-interview-session', JSON.stringify(stateToSave));
      } else {
        localStorage.removeItem('devinspect-interview-session');
      }
    } catch (e) {
      console.warn('Could not save session to storage', e);
    }
  }, []); // stable — reads from ref

  // Ref guard — prevents duplicate concurrent API calls
  const fetchingRef  = useRef(false);
  const evaluatingRef = useRef(false);

  // Stable refs for difficulty/language/company so fetchQuestion useCallback stays stable
  const difficultyRef = useRef(difficulty);
  const languageRef   = useRef(language);
  const companyRef    = useRef(company);
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);
  useEffect(() => { languageRef.current   = language;   }, [language]);
  useEffect(() => { companyRef.current    = company;    }, [company]);

  // Question generator — tries company bank first, then API, then local templates
  const fetchQuestion = useCallback(async (index, currentQuestionsList) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoadingQuestion(true);
    const diff    = difficultyRef.current;
    const lang    = languageRef.current;
    const co      = companyRef.current;

    // 1. Try company question bank first (instant, no network)
    const bankQuestions = getCompanyQuestions(co, lang, (currentQuestionsList?.length || 0) + 10);
    if (bankQuestions[index]) {
      const q = bankQuestions[index];
      const updatedList = [...(currentQuestionsList || [])];
      updatedList[index] = q;
      setQuestions(updatedList);
      setUserCodes(prev => ({ ...(prev || {}), [index]: q.starterCode || LANGUAGES?.[lang]?.template || '// Write code here' }));
      saveSessionToStorage({ questions: updatedList });
      setLoadingQuestion(false);
      fetchingRef.current = false;
      return;
    }

    // 2. Fallback to AI API
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${API_ORIGIN}/api/ai/interview/question`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ difficulty: diff, language: lang, category: 'DSA', company: co }),
        signal:  controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`API ${response.status}`);
      const data = await response.json();
      if (!data?.success || !data?.question) throw new Error('Invalid API response');
      const newQ = {
        title:            data.question.title          || 'Untitled Question',
        description:      data.question.problemStatement || data.question.description || 'No description available',
        hint:             data.question.hints?.[0]     || data.question.hint || 'Analyze inputs and optimize logic.',
        category:         data.question.category       || 'Algorithms',
        difficulty:       data.question.difficulty     || diff,
        language:         lang,
        starterCode:      LANGUAGES?.[lang]?.template  || '// Write code here',
        expectedConcepts: data.question.expectedConcepts || [],
        sampleSolution:   data.question.sampleSolution || data.question.solutions?.[lang]
                          || QUESTION_TEMPLATES?.[diff]?.[0]?.solutions?.[lang]
                          || '// No solution available',
      };
      const updatedList = [...(currentQuestionsList || [])];
      updatedList[index] = newQ;
      setQuestions(updatedList);
      setUserCodes(prev => ({ ...(prev || {}), [index]: LANGUAGES?.[lang]?.template || '// Write code here' }));
      saveSessionToStorage({ questions: updatedList });
    } catch (err) {
      clearTimeout(timeoutId);
      if (err?.name !== 'AbortError') console.warn('API question load failed, using local templates:', err);
      // 3. Final fallback: local QUESTION_TEMPLATES
      const templates = QUESTION_TEMPLATES?.[diff] || QUESTION_TEMPLATES?.medium || [];
      const selected  = templates[index % (templates.length || 1)];
      if (!selected) { setLoadingQuestion(false); fetchingRef.current = false; return; }
      const newQ = {
        title:            selected.title    || 'Untitled Question',
        description:      selected.desc     || 'No description',
        hint:             selected.hint     || 'No hint available',
        category:         selected.category || 'General',
        difficulty:       diff,
        language:         lang,
        starterCode:      LANGUAGES?.[lang]?.template || '// Write code here',
        expectedConcepts: [],
        sampleSolution:   selected.solutions?.[lang] || '// Solution not available in selected language',
      };
      const updatedList = [...(currentQuestionsList || [])];
      updatedList[index] = newQ;
      setQuestions(updatedList);
      setUserCodes(prev => ({ ...(prev || {}), [index]: LANGUAGES?.[lang]?.template || '// Write code here' }));
      saveSessionToStorage({ questions: updatedList });
    } finally {
      setLoadingQuestion(false);
      fetchingRef.current = false;
    }
  }, [saveSessionToStorage]);

  // End Interview Flow
  const handleEndSession = useCallback(() => {
    setRunning(false);
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      localStorage.removeItem('devinspect-interview-session');
    } catch (e) {
      console.warn('Could not remove session from storage', e);
    }
    toast.success("Interview completed! Generating summary dashboard...");
  }, []);

  // Start Session
  const startSession = useCallback(async () => {
    const defaultTimer = DURATIONS[duration] || 900;
    setTimeLeft(defaultTimer);
    setRunning(true);
    setFinished(false);
    setQuestions([]);
    setUserCodes({});
    setEvaluations({});
    setScores({});
    setRevealedAnswers({});
    setSubmittedQuestions({});
    setSessionStats({ correct: 0, wrong: 0 });
    setCurrentQuestionIndex(0);
    fetchingRef.current  = false;
    evaluatingRef.current = false;
    toast.success('Interview session started! Good luck!');
    try {
      await fetchQuestion(0, []);
    } catch (err) {
      console.error('Failed to load first question:', err);
      toast.error('Failed to load question. Please try again.');
      setRunning(false);
    }
  }, [duration, fetchQuestion]);

  // Skip or go to next question — only allowed after submission
  const handleNext = useCallback(async () => {
    if (!Array.isArray(questions) || totalQuestions <= 0) {
      handleEndSession();
      return;
    }
    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx >= totalQuestions) {
      handleEndSession();
      return;
    }
    setCurrentQuestionIndex(nextIdx);
    if (!questions[nextIdx]) {
      try {
        await fetchQuestion(nextIdx, questions);
      } catch (err) {
        console.error('Failed to load next question:', err);
        toast.error('Failed to load next question. Please try again.');
      }
    }
    saveSessionToStorage({ currentQuestionIndex: nextIdx });
  }, [currentQuestionIndex, totalQuestions, questions, handleEndSession, fetchQuestion, saveSessionToStorage]);

  // Go to previous question
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      const prevIdx = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIdx);
      saveSessionToStorage({ currentQuestionIndex: prevIdx });
    }
  }, [currentQuestionIndex, saveSessionToStorage]);

  // Reveal correct answer (with score penalty)
  const handleRevealAnswer = useCallback(() => {
    if (revealedAnswers?.[currentQuestionIndex]) return;
    setRevealedAnswers(prev => ({ ...prev, [currentQuestionIndex]: true }));
    toast.warning('Sample solution revealed. Score for this question will incur a 40% penalty.');
    saveSessionToStorage({ revealedAnswers: { ...revealedAnswers, [currentQuestionIndex]: true } });
  }, [currentQuestionIndex, revealedAnswers, saveSessionToStorage]);

  // ── SUBMIT & EVALUATE ─────────────────────────────────────────────────────
  // Core interview flow: write → submit → AI evaluates → score → feedback → Next unlocked
  const handleEvaluate = useCallback(async () => {
    if (evaluatingRef.current) return;
    // Already submitted this question — prevent re-submission
    if (submittedQuestions?.[currentQuestionIndex]) {
      toast.info('This question has already been submitted.');
      return;
    }
    const currentCode = userCodes?.[currentQuestionIndex] || '';
    if (!currentCode?.trim() || currentCode === LANGUAGES?.[languageRef.current]?.template) {
      toast.error('Please write your solution before submitting.');
      return;
    }
    evaluatingRef.current = true;
    setEvaluating(true);
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 30000);

    // ── Helper: commit result to state + storage ───────────────────
    const commitResult = (calculatedScore, normalizedEval) => {
      const isCorrect = calculatedScore >= 70;
      setScores(prev => ({ ...prev, [currentQuestionIndex]: calculatedScore }));
      setEvaluations(prev => ({ ...prev, [currentQuestionIndex]: normalizedEval }));
      setSubmittedQuestions(prev => ({ ...prev, [currentQuestionIndex]: true }));
      setSessionStats(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        wrong:   prev.wrong   + (isCorrect ? 0 : 1),
      }));
      if (isCorrect) {
        setCelebrationVisible(true);
        setMicroAnim('correct');
        setTimeout(() => setCelebrationVisible(false), 2500);
        setTimeout(() => setMicroAnim(null), 1400);
        toast.success(`Hurray! 🎉 Score: ${calculatedScore}/100`);
      } else {
        setWrongVisible(true);
        setMicroAnim('wrong');
        setTimeout(() => setWrongVisible(false), 1800);
        setTimeout(() => setMicroAnim(null), 1400);
        toast.error(`Oops! 😅 Score: ${calculatedScore}/100 - review the correct solution below`);
      }
      saveSessionToStorage({
        scores:             { ...(scores      || {}), [currentQuestionIndex]: calculatedScore },
        evaluations:        { ...(evaluations || {}), [currentQuestionIndex]: normalizedEval },
        submittedQuestions: { ...(submittedQuestions || {}), [currentQuestionIndex]: true },
        sessionStats: {
          correct: (sessionStats?.correct || 0) + (isCorrect ? 1 : 0),
          wrong:   (sessionStats?.wrong   || 0) + (isCorrect ? 0 : 1),
        },
      });
    };

    const activeQ = questions?.[currentQuestionIndex];

    try {
      const token = localStorage.getItem('devinspect-token');
      if (!activeQ) throw new Error('No active question found');

      // ── Strict AI interviewer prompt ─────────────────────────────
      // Forces AI to return structured evaluation with all required fields.
      const interviewerContext = [
        `You are a strict but fair technical interviewer at a top software company.`,
        ``,
        `QUESTION: ${activeQ.title || 'Unknown'}`,
        `DESCRIPTION: ${activeQ.description || 'No description'}`,
        `DIFFICULTY: ${difficulty}`,
        `CATEGORY: ${activeQ.category || 'General'}`,
        `LANGUAGE: ${language}`,
        `COMPANY STYLE: ${company || 'generic'}`,
        `EXPECTED CONCEPTS: ${(activeQ.expectedConcepts || []).join(', ') || 'N/A'}`,
        ``,
        `REFERENCE SOLUTION (best standard approach):`,
        activeQ.sampleSolution || '// Not available',
        ``,
        `CANDIDATE CODE SUBMITTED:`,
        currentCode,
        ``,
        `EVALUATION INSTRUCTIONS:`,
        `1. Compare candidate code against the reference solution logically.`,
        `2. Score starting at 100. Deduct strictly:`,
        `   - Syntax error: -20`,
        `   - Wrong logic / incorrect algorithm: -30`,
        `   - Incorrect output for given inputs: -25`,
        `   - Inefficient solution (worse time/space complexity): -10 to -20`,
        `   - Missing edge cases: -10`,
        `3. Clamp final score between 0 and 100.`,
        `4. correctCode MUST be the complete, optimized, working solution in ${language}. Never return placeholder text.`,
        `5. mistakes MUST list specific issues found. If none, return empty array.`,
        `6. feedback MUST explain WHY the code is wrong or correct, and what to improve.`,
        `7. If candidate code is correct and optimal, score should be 85-100.`,
      ].join('\n');

      const res = await fetch(`${API_ORIGIN}/api/analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text:     currentCode,
          mode:     evaluationMode,
          language,
          context:  interviewerContext,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data?.result) throw new Error('Invalid response format');

      const r = data.result;

      // ── Score: prefer AI score, else compute from errors per spec ──
      let calculatedScore;
      const aiScore = typeof r?.score === 'number'      ? r.score
                    : typeof r?.codeScore === 'number'  ? r.codeScore
                    : null;
      if (aiScore !== null) {
        calculatedScore = Math.max(0, Math.min(100, aiScore));
      } else {
        calculatedScore = 100;
        (Array.isArray(r?.errors) ? r.errors : []).forEach(e => {
          const sev = String(e?.severity || e?.category || e?.type || '').toLowerCase();
          const msg = String(e?.message  || e?.issue    || '').toLowerCase();
          if      (sev.includes('syntax')   || msg.includes('syntax'))      calculatedScore -= 20;
          else if (sev.includes('logic')    || msg.includes('wrong logic')) calculatedScore -= 30;
          else if (sev.includes('output')   || msg.includes('incorrect output')) calculatedScore -= 25;
          else if (sev.includes('inefficien') || msg.includes('inefficien') ||
                   sev.includes('perf')     || msg.includes('complexity'))  calculatedScore -= 15;
          else if (sev.includes('edge')     || msg.includes('edge case'))   calculatedScore -= 10;
          else if (sev.includes('critical') || sev.includes('high'))        calculatedScore -= 20;
          else if (sev.includes('medium'))                                   calculatedScore -= 10;
          else                                                               calculatedScore -= 5;
        });
        calculatedScore = Math.max(0, Math.min(100, calculatedScore));
      }
      // 40% penalty if answer was peeked before submitting
      if (revealedAnswers?.[currentQuestionIndex]) calculatedScore = Math.floor(calculatedScore * 0.6);
      calculatedScore = Math.max(0, Math.min(100, Math.round(Number(calculatedScore) || 0)));

      // ── correctCode: AI result → question bank → never placeholder ──
      const rawCorrectCode = r?.correctedCode || r?.correctCode || r?.sampleSolution || '';
      const isPlaceholder  = !rawCorrectCode.trim()
        || rawCorrectCode.includes('// Write')
        || rawCorrectCode.includes('template')
        || rawCorrectCode.includes('not available')
        || rawCorrectCode.length < 20;
      const correctCode = isPlaceholder
        ? (activeQ.sampleSolution || '// Standard solution not available')
        : rawCorrectCode;

      // ── mistakes: normalise all possible shapes ──────────────────
      const rawMistakes = Array.isArray(r?.mistakes) ? r.mistakes
                        : Array.isArray(r?.errors)   ? r.errors
                        : [];
      const mistakes = rawMistakes
        .map(m => typeof m === 'string' ? m : (m?.message || m?.issue || m?.description || JSON.stringify(m)))
        .filter(Boolean);

      // ── feedback: explanation + optimisation merged ──────────────
      const feedback = [
        r?.explanation || r?.modeOutput || r?.feedback || '',
        r?.optimizationSuggestion ? `Optimization: ${r.optimizationSuggestion}` : '',
      ].filter(Boolean).join('\n\n') || 'Evaluation complete.';

      const normalizedEval = {
        // Mandatory output fields
        userCode:    currentCode,
        correctCode,
        score:       calculatedScore,
        mistakes,
        feedback,
        // Extended fields used by existing UI panels
        explanation:            feedback,
        correctedCode:          correctCode,
        timeComplexity:         r?.timeComplexity  || activeQ.time  || 'N/A',
        spaceComplexity:        r?.spaceComplexity || activeQ.space || 'N/A',
        optimizationSuggestion: r?.optimizationSuggestion || '',
        strengths:  Array.isArray(r?.strengths)  ? r.strengths  : [],
        weaknesses: Array.isArray(r?.weaknesses) ? r.weaknesses : [],
        verdict:    calculatedScore >= 70 ? 'PASS' : 'FAIL',
        isFallback: false,
      };
      commitResult(calculatedScore, normalizedEval);

    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Evaluation error:', err);

      // ── Fallback: score=50, correctCode from bank, structured output ──
      const fallbackScore = 50;
      const fallbackEval = {
        userCode:    currentCode,
        correctCode: activeQ?.sampleSolution || 'Standard solution not available',
        score:       fallbackScore,
        mistakes:    ['Unable to fully evaluate — AI service unavailable.'],
        feedback:    'Partial evaluation due to missing AI response. Your code has been recorded. Review the reference solution above.',
        explanation:            'Partial evaluation — AI service unavailable. Your code has been recorded.',
        correctedCode:          activeQ?.sampleSolution || 'Standard solution not available',
        timeComplexity:         activeQ?.time  || 'N/A',
        spaceComplexity:        activeQ?.space || 'N/A',
        optimizationSuggestion: '',
        strengths:  [],
        weaknesses: ['Could not fully evaluate due to a service error.'],
        verdict:    'PARTIAL',
        isFallback: true,
      };
      if (err?.name === 'AbortError') {
        toast.warning('Evaluation timed out. Partial score (50) applied.');
      } else if (err?.message?.includes('401') || err?.message?.includes('authorized')) {
        toast.error('Authentication required. Partial score applied.');
      } else {
        toast.warning('AI evaluation failed. Partial score (50) applied.');
      }
      commitResult(fallbackScore, fallbackEval);
    } finally {
      clearTimeout(timeoutId);
      setEvaluating(false);
      evaluatingRef.current = false;
    }
  }, [
    currentQuestionIndex, userCodes, revealedAnswers, evaluationMode, difficulty, language,
    questions, saveSessionToStorage
  ]);


  // Timer tick
  useEffect(() => {
    if (!running || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleEndSession();
          toast.error("Time is up! Your interview has ended.");
          return 0;
        }
        if (prev % 10 === 0) saveSessionToStorage({ timeLeft: prev - 1 });
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, finished, handleEndSession, saveSessionToStorage]);

  // ── useMemo for expensive derived values ─────────────────────────
  const avgScore = useMemo(() => {
    const vals = Object.values(scores || {});
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + (b || 0), 0) / vals.length);
  }, [scores]);

  // Whether current question is already submitted (locks editor + submit)
  const isCurrentSubmitted = submittedQuestions?.[currentQuestionIndex] ?? false;
  // Whether Next is allowed: submitted OR last question already handled
  const canGoNext = isCurrentSubmitted;

  // ── Final report — computed once when finished, stable object ────
  const finalReport = useMemo(() => {
    if (!finished) return null;
    const scoreVals  = Object.values(scores || {});
    const finalScore = scoreVals.length
      ? Math.round(scoreVals.reduce((a, b) => a + (Number(b) || 0), 0) / scoreVals.length)
      : 0;
    const attempted  = Object.keys(submittedQuestions || {}).length;
    const correct    = Number(sessionStats?.correct) || 0;
    const wrong      = Number(sessionStats?.wrong)   || 0;

    // Grade: A+ ≥95 | A ≥85 | B+ ≥75 | B ≥65 | C ≥50 | D <50
    const grade =
      finalScore >= 95 ? 'A+' :
      finalScore >= 85 ? 'A'  :
      finalScore >= 75 ? 'B+' :
      finalScore >= 65 ? 'B'  :
      finalScore >= 50 ? 'C'  : 'D';

    const gradeColor =
      finalScore >= 75 ? 'text-green-500'   :
      finalScore >= 50 ? 'text-amber-500'   : 'text-destructive';

    // Performance message
    const message =
      finalScore >= 80 ? { text: 'Excellent Performance 🎉', color: 'text-green-500' } :
      finalScore >= 60 ? { text: 'Good Job 👍',              color: 'text-primary'   } :
                         { text: 'Needs Improvement 📌',     color: 'text-amber-500' };

    // Show confetti only for score ≥ 80
    const showConfetti = finalScore >= 80;

    return { finalScore, attempted, correct, wrong, grade, gradeColor, message, showConfetti };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]); // intentionally only recomputes when finished flips — prevents re-render loops

  const categoriesStats = useMemo(() => {
    const stats = {};
    (questions || []).forEach((q, idx) => {
      const cat = q?.category || 'Algorithms';
      const sc  = scores?.[idx] || 0;
      if (!stats[cat]) stats[cat] = { total: 0, count: 0 };
      stats[cat].total += sc;
      stats[cat].count += 1;
    });
    return Object.entries(stats).map(([name, data]) => ({
      name,
      avg: Math.round((data.total || 0) / (data.count || 1)),
    }));
  }, [questions, scores]);

  const getRating = useCallback((score) => {
    if (score >= 85) return { text: 'Outstanding (FAANG-ready)', color: 'text-green-500' };
    if (score >= 70) return { text: 'Strong Pass',              color: 'text-primary'    };
    if (score >= 50) return { text: 'Borderline Pass',          color: 'text-amber-500'  };
    return               { text: 'Needs Significant Improvement', color: 'text-destructive' };
  }, []);

  const getScoreColor = useCallback((score) => {
    if (score >= 80) return 'text-green-500 border-green-500/20 bg-green-500/10';
    if (score >= 50) return 'text-amber-500 border-amber-500/20 bg-amber-500/10';
    return 'text-destructive border-destructive/20 bg-destructive/10';
  }, []);

  const getScoreStars = useCallback((score) => {
    const stars = Math.round((score || 0) / 20);
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} className={`w-4 h-4 ${i <= stars ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
        ))}
      </div>
    );
  }, []);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  return (
    <>
      <Helmet><title>Live Interview System | DevInspectAI</title></Helmet>
      <div className="w-full min-h-screen py-8 text-foreground bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gradient mb-2">🎯 Technical Interview Prep</h1>
            <p className="text-muted-foreground">Practice real coding interviews across multiple mode evaluations and difficulty levels.</p>
          </div>

          {/* Configuration mode */}
          {!running && !finished && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="card-glass p-8 rounded-3xl max-w-2xl mx-auto space-y-6"
            >
              <h2 className="text-xl font-bold text-center">⚙️ Configure New Interview Round</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Company / Style</label>
                  <Select value={company} onValueChange={setCompany}>
                    <SelectTrigger className="h-11 input-premium"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COMPANIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Programming Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-11 input-premium"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(LANGUAGES).map(([key, lang]) => (
                        <SelectItem key={key} value={key}>{lang.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Difficulty Level</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="h-11 input-premium"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">🟢 Easy</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="hard">🔴 Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Evaluation Mode</label>
                  <Select value={evaluationMode} onValueChange={setEvaluationMode}>
                    <SelectTrigger className="h-11 input-premium"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">🎓 Student Mode (Guided learning)</SelectItem>
                      <SelectItem value="developer">💻 Developer Mode (Production standard)</SelectItem>
                      <SelectItem value="interviewer">🎯 Interviewer Mode (Strict evaluation)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Questions Count</label>
                  <Select value={String(totalQuestions)} onValueChange={(v) => setTotalQuestions(Number(v))}>
                    <SelectTrigger className="h-11 input-premium"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Questions</SelectItem>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Time Limit</label>
                  <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                    <SelectTrigger className="h-11 input-premium"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={startSession} className="btn-primary w-full h-12 font-bold text-base mt-2 shadow-lg shadow-primary/20">
                <Play className="w-5 h-5 mr-2 fill-current" /> 🚀 Start Interview Round
              </Button>
            </motion.div>
          )}

          {/* Active Interview Mode */}
          {running && !finished && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Celebration overlay — shown briefly on correct answer */}
              <AnimatePresence>
                {celebrationVisible && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.6 }}
                        className="text-7xl select-none"
                      >
                        🎉
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-black text-green-500 drop-shadow-lg"
                      >
                        Correct!
                      </motion.p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Wrong answer overlay */}
              <AnimatePresence>
                {wrongVisible && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <motion.div
                        animate={{ x: [0, -8, 8, -8, 8, -4, 4, 0] }}
                        transition={{ duration: 0.5 }}
                        className="text-7xl select-none"
                      >
                        😅
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-black text-destructive drop-shadow-lg"
                      >
                        Oops 😅 try again!
                      </motion.p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Question Sidebar - 4 Cols */}
              <div className="lg:col-span-4 space-y-4">
                <div className="card-glass p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">🎯 Progress</p>
                      <h3 className="text-lg font-extrabold text-gradient">
                        Question {currentQuestionIndex + 1} / {totalQuestions}
                      </h3>
                    </div>
                    <div className={`flex items-center gap-1.5 font-mono text-sm font-bold bg-background/50 border px-3 py-1.5 rounded-xl transition-colors duration-300 ${
                      timeLeft <= 60
                        ? 'border-destructive/40 text-destructive animate-pulse'
                        : timeLeft <= 120
                        ? 'border-amber-500/40 text-amber-500'
                        : 'border-border/20 text-primary'
                    }`}>
                      <Timer className="w-4 h-4" /> {formatTime(timeLeft)}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <Progress value={((currentQuestionIndex) / totalQuestions) * 100} className="h-2" />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Start</span>
                      <span>Finish</span>
                    </div>
                  </div>

                  {questions?.[currentQuestionIndex] ? (
                    <div className="space-y-4 pt-2">
                      <div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                          difficulty === 'easy' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-destructive/10 text-destructive border-destructive/20'
                        }`}>
                          {difficulty}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2 font-medium">
                          {questions?.[currentQuestionIndex]?.category || 'General'}
                        </span>
                        {company !== 'generic' && (
                          <span className="ml-2 text-xs font-bold text-primary">
                            {COMPANIES.find(c => c.value === company)?.emoji} {COMPANIES.find(c => c.value === company)?.label?.split(' ').slice(1).join(' ')}
                          </span>
                        )}
                      </div>

                      <h2 className="text-xl font-bold">{questions?.[currentQuestionIndex]?.title || 'Untitled Question'}</h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {questions?.[currentQuestionIndex]?.description || 'No description available'}
                      </p>

                      <div className="p-3.5 bg-muted/40 rounded-2xl border border-border/20">
                        <p className="text-xs font-bold text-muted-foreground mb-1 flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Hint
                        </p>
                        <p className="text-xs text-foreground/80">{questions?.[currentQuestionIndex]?.hint || 'No hint available'}</p>
                      </div>

                      {questions?.[currentQuestionIndex]?.expectedConcepts?.length > 0 && (
                        <div className="p-3 bg-primary/5 border border-primary/10 rounded-2xl">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1.5">Key Concepts</p>
                          <div className="flex flex-wrap gap-1">
                            {questions[currentQuestionIndex].expectedConcepts.map((c, i) => (
                              <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full border border-primary/20">{c}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      {/* Loading skeleton */}
                      <div className="space-y-2">
                        <div className="skeleton h-4 w-20" />
                        <div className="skeleton h-6 w-3/4" />
                      </div>
                      <div className="skeleton h-16 w-full" />
                      <div className="skeleton h-12 w-full" />
                      <div className="skeleton h-8 w-1/2" />
                    </div>
                  )}

                  {/* Answer Reveal Button */}
                  {questions?.[currentQuestionIndex] && (
                    <div className="pt-2 border-t border-border/20">
                      {!revealedAnswers?.[currentQuestionIndex] ? (
                        <Button 
                          onClick={handleRevealAnswer}
                          variant="outline"
                          className="w-full text-xs h-9 border-amber-500/30 text-amber-600 hover:bg-amber-500/10 rounded-xl"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" /> Reveal Ideal Solution
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          {/* Explanation */}
                          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                            <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold mb-2">
                              <EyeOff className="w-3.5 h-3.5" /> Ideal Solution Revealed
                            </div>
                            <pre className="p-2.5 bg-background/50 rounded-lg text-[10px] font-mono overflow-x-auto max-h-36 whitespace-pre-wrap select-text">
                              {questions?.[currentQuestionIndex]?.sampleSolution || '// Solution not available'}
                            </pre>
                          </div>
                          {/* Side-by-side comparison if user has written code */}
                          {(userCodes?.[currentQuestionIndex] || evaluations?.[currentQuestionIndex]?.userCode) && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Your Code vs Ideal</p>
                              <div className="grid grid-cols-1 gap-2">
                                <div className="p-2 bg-destructive/5 border border-destructive/20 rounded-lg">
                                  <p className="text-[10px] font-bold text-destructive mb-1">📌 Your Code</p>
                                  <pre className="text-[10px] font-mono overflow-x-auto max-h-24 whitespace-pre-wrap text-foreground/70">
                                    {userCodes?.[currentQuestionIndex] || evaluations?.[currentQuestionIndex]?.userCode || ''}
                                  </pre>
                                </div>
                                <div className="p-2 bg-green-500/5 border border-green-500/20 rounded-lg">
                                  <p className="text-[10px] font-bold text-green-500 mb-1">✅ Ideal Code</p>
                                  <pre className="text-[10px] font-mono overflow-x-auto max-h-24 whitespace-pre-wrap text-foreground/70">
                                    {evaluations?.[currentQuestionIndex]?.correctedCode || questions?.[currentQuestionIndex]?.sampleSolution || '// Not available'}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          )}
                          {/* Mistakes from evaluation if available */}
                          {(evaluations?.[currentQuestionIndex]?.mistakes?.length > 0) && (
                            <div className="p-2 bg-muted/30 border border-border/20 rounded-lg">
                              <p className="text-[10px] font-bold text-destructive mb-1">⚠️ Mistakes</p>
                              <ul className="space-y-0.5">
                                {(evaluations?.[currentQuestionIndex]?.mistakes || []).slice(0, 3).map((m, i) => (
                                  <li key={i} className="text-[10px] text-muted-foreground">
                                    {i + 1}. {typeof m === 'string' ? m : (m?.message || m?.issue || String(m))}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Score badge for evaluated question */}
                {scores?.[currentQuestionIndex] !== undefined && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card-glass p-5 rounded-3xl text-center space-y-2 border border-primary/20"
                  >
                    <Trophy className="w-8 h-8 text-amber-500 mx-auto" />
                    <p className="text-3xl font-black text-gradient">{scores?.[currentQuestionIndex]}/100</p>
                    <p className="text-xs text-muted-foreground font-semibold">Question Score</p>
                    <div className="flex justify-center">{getScoreStars(scores?.[currentQuestionIndex])}</div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={handlePrevious} 
                    disabled={currentQuestionIndex === 0}
                    variant="outline" 
                    className="flex-1 h-10 rounded-xl"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <Button 
                    onClick={handleNext}
                    disabled={!canGoNext}
                    title={!canGoNext ? 'Submit your solution first to unlock Next' : ''}
                    variant="outline" 
                    className="flex-1 h-10 rounded-xl hover:bg-primary/5 disabled:opacity-40"
                  >
                    {currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Next'} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <Button 
                  onClick={handleEndSession} 
                  variant="ghost" 
                  className="w-full text-destructive hover:bg-destructive/10 h-10 rounded-xl border border-destructive/20"
                >
                  <Square className="w-4 h-4 mr-1.5" /> Cancel Interview
                </Button>
              </div>

              {/* Editor + AI feedback panel - 8 Cols */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Editor Container */}
                <div className="card-glass p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold">🧠 Solution Editor</span>
                      <span className="text-xs text-muted-foreground uppercase">({LANGUAGES[language]?.name})</span>
                    </div>

                    <Button 
                      onClick={handleEvaluate}
                      disabled={evaluating || loadingQuestion || isCurrentSubmitted}
                      className="btn-primary h-9 text-xs font-bold px-4"
                    >
                      {evaluating ? (
                        <>
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full mr-2" />
                          🧠 Analyzing...
                        </>
                      ) : isCurrentSubmitted ? (
                        <><Check className="w-4 h-4 mr-1" /> ✅ Submitted</>
                      ) : (
                        <><ChevronRight className="w-4 h-4 mr-1" /> ⚡ Submit Solution</>
                      )}
                    </Button>
                  </div>

                  <Textarea
                    value={userCodes?.[currentQuestionIndex] || ''}
                    onChange={(e) => setUserCodes(prev => ({ ...(prev || {}), [currentQuestionIndex]: e.target.value }))}
                    disabled={evaluating || loadingQuestion || isCurrentSubmitted}
                    placeholder={`Write your code here...`}
                    className="font-mono text-sm leading-relaxed min-h-[380px] bg-background/50 rounded-2xl border-border/30 resize-none p-4 focus-visible:ring-primary/20"
                    spellCheck={false}
                  />
                </div>

                {/* Live Evaluation feedback display */}
                <AnimatePresence mode="wait">
                  {evaluations?.[currentQuestionIndex] && (
                    <motion.div
                      key={currentQuestionIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className={`card-glass p-6 rounded-3xl space-y-5 ${
                        microAnim === 'correct' ? 'anim-pop' :
                        microAnim === 'wrong'   ? 'anim-shake' : ''
                      }`}
                    >
                      {/* ⚡ Micro-particle burst — 8 dots, correct=green sparks, wrong=falling dots */}
                      <AnimatePresence>
                        {microAnim && (
                          <div className="relative h-0 overflow-visible pointer-events-none" aria-hidden="true">
                            {Array.from({ length: 9 }).map((_, i) => {
                              const isCorrectAnim = microAnim === 'correct';
                              const angle = (i / 9) * 360;
                              const rad   = (angle * Math.PI) / 180;
                              const dist  = 38 + (i % 3) * 14;
                              const tx    = isCorrectAnim ? Math.cos(rad) * dist : (i % 2 === 0 ? -8 : 8);
                              const ty    = isCorrectAnim ? Math.sin(rad) * dist : 48 + i * 6;
                              return (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                                  animate={{ opacity: 0, x: tx, y: ty, scale: isCorrectAnim ? 0.4 : 0.6 }}
                                  transition={{ duration: 1.1, ease: 'easeOut', delay: i * 0.04 }}
                                  className="absolute left-1/2 top-0 w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: isCorrectAnim
                                      ? ['#22c55e','#86efac','#4ade80','#16a34a','#bbf7d0','#15803d','#dcfce7','#166534','#4ade80'][i]
                                      : ['#f87171','#fca5a5','#ef4444','#fecaca','#dc2626','#fee2e2','#b91c1c','#fca5a5','#f87171'][i],
                                  }}
                                />
                              );
                            })}
                          </div>
                        )}
                      </AnimatePresence>

                      {/* Verdict banner */}
                      {(() => {
                        const ev = evaluations[currentQuestionIndex];
                        const isPass    = ev?.verdict === 'PASS';
                        const isPartial = ev?.isFallback;
                        return (
                          <div className={`flex items-center gap-3 p-3 rounded-2xl border ${
                            isPartial ? 'bg-amber-500/10 border-amber-500/20'
                            : isPass  ? 'bg-green-500/10 border-green-500/20'
                                      : 'bg-destructive/10 border-destructive/20'
                          }`}>
                            {isPartial ? <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                              : isPass ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                       : <XCircle className="w-5 h-5 text-destructive shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-black ${
                                isPartial ? 'text-amber-500' : isPass ? 'text-green-500' : 'text-destructive'
                              }`}>
                                {isPartial ? 'Partial Evaluation'
                                  : isPass ? '✅ Correct — Well done! 🎉'
                                           : '❌ Needs Improvement 😅'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Score: <strong>{ev?.score ?? 0}/100</strong>
                                {isPartial && ' — AI unavailable, partial score applied'}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      <h3 className="font-bold text-sm text-gradient flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" />
                        AI Evaluation ({evaluationMode?.toUpperCase() || 'INTERVIEWER'})
                      </h3>

                      {/* 📌 Your Code */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5" /> 📌 Your Code
                        </p>
                        <pre className="p-3 bg-destructive/5 border border-destructive/10 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre select-text text-foreground/80 max-h-48">
                          {evaluations[currentQuestionIndex]?.userCode || userCodes?.[currentQuestionIndex] || '// No code submitted'}
                        </pre>
                      </div>

                      {/* 📌 Correct Code */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-green-500 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> 📌 Correct Code (AI verified best solution)
                        </p>
                        <pre className="p-3 bg-green-500/5 border border-green-500/20 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre select-text text-foreground max-h-48">
                          {evaluations[currentQuestionIndex]?.correctCode
                            || evaluations[currentQuestionIndex]?.correctedCode
                            || questions?.[currentQuestionIndex]?.sampleSolution
                            || '// Standard solution not available'}
                        </pre>
                      </div>

                      {/* 📌 Mistakes */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> 📌 Mistakes
                        </p>
                        {(evaluations[currentQuestionIndex]?.mistakes?.length > 0) ? (
                          <ul className="space-y-1">
                            {evaluations[currentQuestionIndex].mistakes.map((m, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground flex gap-1.5 items-start p-2 bg-destructive/5 rounded-lg border border-destructive/10">
                                <span className="text-destructive shrink-0 font-bold">{idx + 1}.</span>
                                <span>{typeof m === 'string' ? m : (m?.message || m?.issue || JSON.stringify(m))}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-green-500 p-2 bg-green-500/5 rounded-lg border border-green-500/10">
                            ✅ No mistakes found — solution looks correct!
                          </p>
                        )}
                      </div>

                      {/* 📌 Score + Feedback */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5" /> 📌 Score: {evaluations[currentQuestionIndex]?.score ?? 0}/100 — Feedback
                        </p>
                        <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap">
                          {evaluations[currentQuestionIndex]?.feedback
                            || evaluations[currentQuestionIndex]?.explanation
                            || 'Evaluation complete.'}
                        </div>
                      </div>

                      {/* Complexity metrics */}
                      {(evaluations[currentQuestionIndex]?.timeComplexity || evaluations[currentQuestionIndex]?.spaceComplexity) && (
                        <div className="grid grid-cols-2 gap-3 border-t border-border/20 pt-4">
                          <div className="p-3 bg-muted/40 rounded-xl border border-border/20 text-xs">
                            <p className="text-muted-foreground">Time Complexity</p>
                            <p className="font-bold text-foreground">{evaluations[currentQuestionIndex]?.timeComplexity || 'N/A'}</p>
                          </div>
                          <div className="p-3 bg-muted/40 rounded-xl border border-border/20 text-xs">
                            <p className="text-muted-foreground">Space Complexity</p>
                            <p className="font-bold text-foreground">{evaluations[currentQuestionIndex]?.spaceComplexity || 'N/A'}</p>
                          </div>
                        </div>
                      )}

                      {/* Strengths & Weaknesses */}
                      {evaluations?.[currentQuestionIndex]?.strengths?.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/20 pt-4">
                          <div>
                            <p className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2">Strengths</p>
                            <ul className="space-y-1">
                              {evaluations[currentQuestionIndex].strengths.map((str, idx) => (
                                <li key={idx} className="text-xs text-muted-foreground flex gap-1.5 items-start">
                                  <span className="text-green-500 shrink-0">•</span> {str || ''}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-destructive uppercase tracking-wider mb-2">Areas for Improvement</p>
                            <ul className="space-y-1">
                              {(evaluations[currentQuestionIndex]?.weaknesses || []).map((wk, idx) => (
                                <li key={idx} className="text-xs text-muted-foreground flex gap-1.5 items-start">
                                  <span className="text-destructive shrink-0">•</span> {wk || ''}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

            </div>
          )}

          {/* Final Summary Dashboard */}
          {finished && finalReport && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-glass p-8 rounded-3xl max-w-4xl mx-auto space-y-8"
            >

              {/* Confetti burst — score ≥ 80 only, runs once on mount */}
              {finalReport.showConfetti && (
                <AnimatePresence>
                  <motion.div
                    key="confetti"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ delay: 2.8, duration: 0.4 }}
                    className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
                  >
                    {Array.from({ length: 28 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{
                          x: `${Math.random() * 100}vw`,
                          y: '-10vh',
                          rotate: 0,
                          opacity: 1,
                        }}
                        animate={{
                          y: '110vh',
                          rotate: Math.random() * 720 - 360,
                          opacity: [1, 1, 0],
                        }}
                        transition={{
                          duration: 2.2 + Math.random() * 1.2,
                          delay: Math.random() * 0.6,
                          ease: 'easeIn',
                        }}
                        className="absolute w-2.5 h-2.5 rounded-sm"
                        style={{
                          backgroundColor: ['#6366f1','#22c55e','#f59e0b','#ec4899','#3b82f6','#a855f7'][i % 6],
                        }}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Top Banner */}
              <div className="text-center space-y-3 py-4">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                >
                  <Trophy className="w-16 h-16 text-amber-500 mx-auto" />
                </motion.div>
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-black">🎉 Interview Session Completed!</h2>
                  <p className={`text-lg font-bold ${finalReport.message.color}`}>
                    {finalReport.message.text}
                  </p>
                  <p className="text-muted-foreground text-sm">Here is your full performance report.</p>
                </div>
              </div>

              {/* Final Report — 6 stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-5 bg-muted/40 border border-border/20 rounded-2xl text-center space-y-1">
                  <p className="text-3xl font-black text-primary">{finalReport.attempted}</p>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Questions Attempted</p>
                </div>
                <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-2xl text-center space-y-1">
                  <p className="text-3xl font-black text-green-500">{finalReport.correct}</p>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Correct (≥70)</p>
                </div>
                <div className="p-5 bg-destructive/10 border border-destructive/20 rounded-2xl text-center space-y-1">
                  <p className="text-3xl font-black text-destructive">{finalReport.wrong}</p>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Wrong (&lt;70)</p>
                </div>
                <div className="p-5 bg-primary/10 border border-primary/20 rounded-2xl text-center space-y-1">
                  <p className="text-3xl font-black text-primary">{finalReport.finalScore}</p>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Final Score</p>
                </div>
                <div className="p-5 bg-muted/40 border border-border/20 rounded-2xl text-center space-y-1">
                  <p className={`text-3xl font-black ${finalReport.gradeColor}`}>{finalReport.grade}</p>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Grade</p>
                </div>
                <div className="p-5 bg-muted/40 border border-border/20 rounded-2xl text-center space-y-1">
                  <p className={`text-sm font-black truncate ${getRating(finalReport.finalScore)?.color || 'text-primary'}`}>
                    {getRating(finalReport.finalScore)?.text || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Verdict</p>
                </div>
              </div>

              {/* Categorized Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Category stats */}
                <div className="p-6 bg-muted/30 border border-border/20 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-primary" /> Topic Performance
                  </h3>
                  <div className="space-y-3">
                    {(categoriesStats || []).map(stat => (
                      <div key={stat?.name || 'unknown'} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>{stat?.name || 'Unknown'}</span>
                          <span>{stat?.avg || 0}%</span>
                        </div>
                        <Progress value={stat?.avg || 0} className="h-1.5" />
                      </div>
                    ))}
                    {(!categoriesStats || categoriesStats.length === 0) && (
                      <p className="text-xs text-muted-foreground">No topic data available.</p>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-6 bg-muted/30 border border-border/20 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <BrainCircuit className="w-4 h-4 text-primary" /> Key Recommendations
                  </h3>
                  <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                    {finalReport.finalScore >= 80 ? (
                      <p>✨ Excellent performance! Keep practicing high-difficulty DP problems and system design patterns. You are well prepared for top-tier technical evaluations.</p>
                    ) : finalReport.finalScore >= 60 ? (
                      <p>💡 Solid foundations. Focus on improving code efficiency and optimizing data structure lookups to reach optimal time complexities.</p>
                    ) : (
                      <p>⚠️ Work on core concepts like recursive algorithms, memory management, and Big-O efficiency. Start with easy problems before scaling to mediums.</p>
                    )}
                    <p className="pt-2 border-t border-border/20">Try running reviews in <strong>Developer Mode</strong> inside the main Analyzer for deep production-level feedback.</p>
                  </div>
                </div>
              </div>

              {/* Round-by-Round Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">📊 Round-by-Round Breakdown</h3>
                <div className="space-y-2">
                  {(questions || []).map((q, idx) => {
                    const qScore   = scores?.[idx];
                    const verdict  = evaluations?.[idx]?.verdict || '';
                    const submitted = submittedQuestions?.[idx] ?? false;
                    return (
                      <div key={idx} className="p-4 bg-muted/20 border border-border/20 rounded-2xl flex justify-between items-center text-sm">
                        <div className="min-w-0 flex items-center gap-2">
                          {submitted ? (
                            verdict === 'PASS'
                              ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                              : verdict === 'PARTIAL'
                                ? <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                : <XCircle className="w-4 h-4 text-destructive shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-border/40 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-bold truncate">{q?.title || 'Untitled Question'}</p>
                            <p className="text-xs text-muted-foreground capitalize">{q?.category || 'General'} · {q?.difficulty || 'Medium'}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${getScoreColor(qScore ?? 0)}`}>
                            {qScore !== undefined ? `${qScore}/100` : 'Skipped'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Restart */}
              <div className="text-center pt-4">
                <Button
                  onClick={() => {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setFinished(false); setRunning(false); setQuestions([]);
                    setScores({}); setEvaluations({}); setUserCodes({});
                    setRevealedAnswers({}); setSubmittedQuestions({});
                    setSessionStats({ correct: 0, wrong: 0 }); setCurrentQuestionIndex(0);
                    setCelebrationVisible(false); setWrongVisible(false); setMicroAnim(null);
                    try { localStorage.removeItem('devinspect-interview-session'); } catch {}
                  }}
                  className="btn-primary px-8 h-11 rounded-xl font-bold"
                >
                  🔄 Start New Interview Round
                </Button>
              </div>

            </motion.div>
          )}

        </div>
      </div>
    </>
  );
};

export default InterviewPage;