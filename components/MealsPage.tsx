
import React, { useState, useEffect } from 'react';
import { User, Meal, MealRating, RATING_LABELS, getAverageRating } from '../types';

interface MealsPageProps {
  user: User;
}

const MealsPage: React.FC<MealsPageProps> = ({ user }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);

  useEffect(() => {
    const allMeals: Meal[] = JSON.parse(localStorage.getItem('familyhub_meals') || '[]');
    setMeals(allMeals.filter(m => m.familyId === user.familyId));
  }, [user.familyId]);

  const saveToStorage = (updatedMeals: Meal[]) => {
    const otherMeals: Meal[] = JSON.parse(localStorage.getItem('familyhub_meals') || '[]')
      .filter((m: Meal) => m.familyId !== user.familyId);
    localStorage.setItem('familyhub_meals', JSON.stringify([...otherMeals, ...updatedMeals]));
    setMeals(updatedMeals);
  };

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName.trim()) return;

    const newMeal: Meal = {
      id: Math.random().toString(36).substr(2, 9),
      familyId: user.familyId!,
      name: newMealName,
      ratings: [],
      createdAt: Date.now(),
    };

    saveToStorage([...meals, newMeal]);
    setNewMealName('');
    setIsAdding(false);
    setExpandedMealId(newMeal.id);
  };

  const updateRating = (mealId: string, score: number, comment: string) => {
    const updatedMeals = meals.map(m => {
      if (m.id === mealId) {
        const otherRatings = m.ratings.filter(r => r.userId !== user.id);
        const newRating: MealRating = {
          userId: user.id,
          userName: user.name,
          score: score as any,
          comment: comment.trim(),
          timestamp: Date.now(),
        };
        return { ...m, ratings: [...otherRatings, newRating] };
      }
      return m;
    });
    saveToStorage(updatedMeals);
  };

  const removeMeal = (id: string) => {
    if (window.confirm('Delete this meal from the list?')) {
      saveToStorage(meals.filter(m => m.id !== id));
    }
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(new Date(timestamp));
  };

  // Sorting: Lowest Average to Highest Average
  const sortedMeals = [...meals].sort((a, b) => {
    const avgA = getAverageRating(a.ratings);
    const avgB = getAverageRating(b.ratings);
    return avgA - avgB;
  });

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Family Meals</h2>
          <p className="text-sm text-gray-500">Rate and review household favorites</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-sky-600 text-white p-3 rounded-full shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-sky-100 animate-in zoom-in-95 duration-200">
          <form onSubmit={handleAddMeal} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">What meal are we adding?</label>
              <input
                type="text"
                value={newMealName}
                onChange={(e) => setNewMealName(e.target.value)}
                autoFocus
                className="w-full px-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-sky-500 outline-none text-lg font-medium"
                placeholder="e.g. Sunday Roast"
              />
            </div>
            <div className="flex space-x-3 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 text-gray-500 font-bold">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-sky-600 text-white rounded-2xl font-bold shadow-lg">Create Meal</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {sortedMeals.length === 0 ? (
          <div className="text-center py-20 px-10 bg-white rounded-3xl border-2 border-dashed border-sky-100">
            <div className="text-5xl mb-4 opacity-50">🍱</div>
            <h3 className="text-xl font-bold text-gray-400">No meals yet</h3>
            <p className="text-gray-400 mt-2 italic">Add something delicious to start the conversation!</p>
          </div>
        ) : (
          sortedMeals.map(meal => {
            const avg = getAverageRating(meal.ratings);
            const myRating = meal.ratings.find(r => r.userId === user.id);
            const isExpanded = expandedMealId === meal.id;

            return (
              <div key={meal.id} className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${
                isExpanded ? 'shadow-xl border-sky-300 ring-2 ring-sky-50' : 'shadow-sm border-sky-50'
              }`}>
                {/* Header Section */}
                <div 
                  onClick={() => setExpandedMealId(isExpanded ? null : meal.id)}
                  className="p-5 flex items-center justify-between cursor-pointer active:bg-sky-50/50"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-gray-800 text-xl truncate">{meal.name}</h4>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        avg >= 4 ? 'bg-green-100 text-green-700' :
                        avg >= 3 ? 'bg-sky-100 text-sky-700' :
                        avg > 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {avg > 0 ? `Avg: ${avg}` : 'No ratings'}
                      </span>
                      <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter">
                        {meal.createdAt ? formatDate(meal.createdAt) : 'Recently'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {myRating && (
                      <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                        {myRating.score}
                      </div>
                    )}
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Section */}
                {isExpanded && (
                  <div className="px-5 pb-6 border-t border-sky-50 pt-5 animate-in slide-in-from-top-2">
                    <div className="mb-4 px-1">
                       <p className="text-[10px] font-bold text-gray-400 uppercase">Created on {meal.createdAt ? formatDate(meal.createdAt) : 'Unknown date'}</p>
                    </div>

                    {/* All Comments */}
                    <div className="space-y-3 mb-8">
                      <h5 className="text-xs font-bold text-sky-600 uppercase tracking-widest px-1">Family Feedback</h5>
                      {meal.ratings.length === 0 ? (
                        <p className="text-sm text-gray-400 italic px-1">Be the first to rate this!</p>
                      ) : (
                        meal.ratings.map(r => (
                          <div key={r.userId} className="flex flex-col space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-700">{r.userName} {r.userId === user.id && '(You)'}</span>
                              <span className="text-[10px] text-gray-300">{formatDate(r.timestamp)}</span>
                            </div>
                            <div className="bg-sky-50/50 p-3 rounded-2xl rounded-tl-none border border-sky-100">
                              <div className="flex items-center mb-1">
                                <span className="text-xs font-bold text-sky-700 mr-2">{r.score}/5</span>
                                <span className="text-xs text-sky-500 font-medium">{RATING_LABELS[r.score]}</span>
                              </div>
                              {r.comment && <p className="text-sm text-gray-600 leading-tight">"{r.comment}"</p>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Rate Form */}
                    <div className="bg-sky-100/30 p-4 rounded-2xl">
                      <h5 className="text-sm font-bold text-gray-800 mb-3">{myRating ? 'Update Your Rating' : 'Your Turn to Rate'}</h5>
                      <div className="flex justify-between mb-4 space-x-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button
                            key={s}
                            onClick={() => updateRating(meal.id, s, myRating?.comment || '')}
                            className={`flex-1 h-10 rounded-xl font-bold transition-all ${
                              myRating?.score === s 
                                ? 'bg-sky-600 text-white shadow-md scale-105' 
                                : 'bg-white text-sky-600 border border-sky-100'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <textarea
                          placeholder="Add a comment... (optional)"
                          className="w-full p-3 rounded-xl border border-sky-100 focus:border-sky-400 outline-none text-sm min-h-[80px] resize-none"
                          value={myRating?.comment || ''}
                          onChange={(e) => updateRating(meal.id, myRating?.score || 3, e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={() => removeMeal(meal.id)}
                        className="text-xs text-red-300 hover:text-red-500 font-medium px-2 py-1"
                      >
                        Remove Meal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {sortedMeals.length > 0 && (
        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest pb-8">
          Meals ordered by household average score
        </p>
      )}
    </div>
  );
};

export default MealsPage;
