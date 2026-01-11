/**
 * @fileoverview useTeamMembers Hook
 * Manages team members with CRUD operations (fetch, add, remove)
 * Enriches member data with real-time clock in/out status
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { getTeamById, addTeamMember, removeTeamMember } from "@/lib/services/teams/teamsService";
import { Member } from "@/lib/types/teams";
import { transformMembers } from "@/lib/utils/teamTransformers";
import { useTeamTimeRecordings } from "./useTeamTimeRecordings";
import {
  calculateMemberStatus,
  calculateSituation,
  hasActiveClockIn,
} from "@/lib/services/statusCalculator";

interface UseTeamMembersResult {
  members: Member[];
  loading: boolean;
  error: string | null;
  addMembers: (memberIds: number[]) => Promise<void>;
  removeMember: (memberId: number) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage team members with CRUD operations
 * Enriches member data with real-time clock in/out status
 * @param teamId - The ID of the team
 * @param managerId - The ID of the team manager
 * @param teamShift - The formatted shift string for members
 * @returns Members array with CRUD operations and state
 */
export function useTeamMembers(
  teamId: number,
  managerId: number | null,
  teamShift: string,
): UseTeamMembersResult {
  const [baseMembers, setBaseMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch time recordings for the team (auto-refreshes every 60s)
  const { recordings: timeRecordings, loading: recordingsLoading } = useTeamTimeRecordings(teamId);

  const fetchMembers = useCallback(async () => {
    if (!managerId) return;

    try {
      setLoading(true);
      setError(null);

      const teamData = await getTeamById(teamId);
      const transformedMembers = transformMembers(teamData.members ?? [], managerId, teamShift);
      setBaseMembers(transformedMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Équipe introuvable");
    } finally {
      setLoading(false);
    }
  }, [teamId, managerId, teamShift]);

  useEffect(() => {
    if (teamId && managerId) {
      fetchMembers();
    }
  }, [teamId, managerId, teamShift, fetchMembers]);

  // Enrich members with clock in/out data using useMemo
  const members = useMemo(() => {
    if (recordingsLoading || Object.keys(timeRecordings).length === 0 || baseMembers.length === 0) {
      return baseMembers;
    }

    return baseMembers.map((member) => {
      const userRecordings = timeRecordings[member.id] || [];

      // Calculate real-time status based on recordings
      const calculatedStatus = calculateMemberStatus(userRecordings, member.shift, new Date());

      // Calculate situation (onsite/telework)
      const calculatedSituation = calculateSituation(userRecordings);

      // Check if user has active clock in
      const isActive = hasActiveClockIn(userRecordings);

      // Get last Arrival and Departure
      const arrivals = userRecordings.filter((r) => r.type === "Arrival");
      const departures = userRecordings.filter((r) => r.type === "Departure");

      const lastClockIn = arrivals.length > 0 ? arrivals[arrivals.length - 1] : undefined;
      const lastClockOut = departures.length > 0 ? departures[departures.length - 1] : undefined;

      return {
        ...member,
        status: calculatedStatus,
        situation: calculatedSituation,
        lastClockIn: lastClockIn ? new Date(lastClockIn.timestamp) : undefined,
        lastClockOut: lastClockOut ? new Date(lastClockOut.timestamp) : undefined,
        clockStatus: isActive ? "active" : lastClockOut ? "paused" : "none",
      };
    });
  }, [baseMembers, timeRecordings, recordingsLoading]);

  /**
   * Add multiple members to the team
   */
  const addMembers = async (memberIds: number[]): Promise<void> => {
    try {
      // Add each member to the team
      await Promise.all(memberIds.map((userId) => addTeamMember(teamId, userId)));

      // Refresh member list
      await fetchMembers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add members";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Remove a member from the team
   */
  const removeMember = async (memberId: number): Promise<void> => {
    try {
      await removeTeamMember(teamId, memberId);
      setBaseMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to remove member";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    members,
    loading,
    error,
    addMembers,
    removeMember,
    refetch: fetchMembers,
  };
}
