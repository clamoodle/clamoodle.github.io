# LC 310
# n: int, edges: List[List[int]] -> List[int]
def findMinHeightTrees(n, edges):
    # Brute force O(n^2)
    import collections
    
    # Build graph, neighbours[i] = set(neighbour nodes of node i)
    neighbours = collections.defaultdict()
    for e in edges:
        neighbours[e[0]].add(e[1])
        neighbours[e[1]].add(e[0])
        
    # Find height of the tree when each node is the root
    min_height = float('inf')
    roots = []
    
    for i in range(n):
        height = self.getHeight(i, neighbours)
        # Update min_height or add to roots accordingly
        if height < min_height:
            min_height = height
            roots = [i]  # Reset old nodes with taller heights
        elif height == min_height:
            roots.append(i)
    
    return roots
        

# Returns the height of a tree with specified root
def getHeight(self, root, graph):
    max_h = 0
    for neighbor in graph[root]:
        curr_h = self.getHeight(neighbor, graph) + 1
        max_h = max(max_h, curr_h)
    
    return max_h


# LC 621
def leastinterval(self, tasks, n):
    if n == 0:
        return len(tasks)
    
    # O(nlogn) time, sort then dequeue
    import collections
    
    # Sort all letters from highest frequency to lowest
    time = 0
    chars_counter = collections.Counter(tasks)
    sorted = list(chars_counter.keys()).sort(key = chars.entries)
    
    while chars_counter:
        seen = deque()  # Last n items seen
        
        # Iterate through sorted from start to end, n characters at a time
        curr_iter = 0
        for c in sorted:
            # Skip if c in 'seen' queue or we've already counted all occurences
            if c in seen or c not in chars_counter.keys():
                continue
            
            # Count and decrement c counter
            seen.append(c)
            seen.popleft() if len(seen) > n else None
            chars_counter[c] -= 1
            if chars_counter[c] == 0:
                chars_counter.pop(c)
            time += 1
    
    return time
    
    